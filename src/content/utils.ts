// 工具
import { onMounted, onUnmounted, ref, Ref, isRef } from 'vue';

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function useMouse() {
    let x = ref(0);
    let y = ref(0);
    
    useEvent(document.body, 'mousemove', e => {
        x.value = e.clientX;
        y.value = e.clientY;
    })
    
    return { x, y };
}


function useEvent<E extends keyof HTMLElementEventMap>(
    target: Ref<HTMLElement|undefined> | HTMLElement | Document,
    evt: E, cb: (e: HTMLElementEventMap[E]) => void)
{
    onMounted(() => {
    let real = isRef(target) ? target.value : target;
        // @ts-ignore
        real?.addEventListener(evt, cb);
    })
    onUnmounted(() => {
    let real = isRef(target) ? target.value : target;
        // @ts-ignore
        real?.removeEventListener(evt, cb);
    })
}

function throttle(func: Function, delay: number) {
  let lastTime = 0;
  
  return function(...args: any[]) {
    const currentTime = Date.now();
    
    if (currentTime - lastTime >= delay) {
    //   func.apply(this, args);
      func(args)
      lastTime = currentTime;
    }
  };
}

export { sleep, useEvent, useMouse, throttle }