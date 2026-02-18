export class NSFWClient {
  private worker: Worker;
  ready = false;

  constructor() {
    this.worker = new Worker(new URL('./nsfw.worker.ts', import.meta.url), { type: 'module' });

    this.worker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        this.ready = true;
        console.log('NSFW Worker Ready');
      }

      if (e.data.type === 'result') {
        this.onResult?.(e.data.predictions);
      }
    };

    this.worker.postMessage({ type: 'init' });
  }

  onResult?: (predictions: any[]) => void;

  scan(imageData: ImageData) {
    this.worker.postMessage({ type: 'scan', payload: imageData });
  }
}
