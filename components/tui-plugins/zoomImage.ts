import {type PluginContext} from '@toast-ui/editor';

function createImageModel(src: string) {
  const parser = new DOMParser();
  const root = parser
    .parseFromString(
      `<div title="点击关闭" style="cursor:zoom-out;position:fixed;left:0;right:0;bottom:0;top:0;z-index:1000;background:rgba(0,0,0,.4);display:flex;justify-content:center;align-items:center;overflow:auto;backdrop-filter:blur(10px);">
        <img style="width:80%" src="${src}" />
      </div>`,
      'text/html'
    )
    .getElementsByTagName('div')[0];

  function destroy() {
    root.remove();
  }

  root.addEventListener('click', destroy, {
    passive: true,
    once: true,
  });

  document.body.appendChild(root);

  return destroy;
}

export function ZoomImage({eventEmitter}: PluginContext) {
  let cleanHandler: () => void;

  eventEmitter.listen('load', ({preview: {previewContent}}) => {
    (previewContent as HTMLElement).addEventListener(
      'click',
      ({target}) => {
        if (target instanceof HTMLImageElement) {
          cleanHandler = createImageModel(target.src);
        }
      },
      {
        passive: true,
      }
    );
  });

  eventEmitter.listen('destroy', () => cleanHandler?.());

  return {};
}
