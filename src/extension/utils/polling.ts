
// Polling utility for waiting for elements to appear
export function waitForElement(
  selector: string, 
  timeout: number = 5000,
  interval: number = 100
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const poll = () => {
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(null);
        return;
      }
      
      setTimeout(poll, interval);
    };
    
    poll();
  });
}

export function waitForElements(
  selectors: string[],
  timeout: number = 5000,
  interval: number = 100
): Promise<Element[]> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const poll = () => {
      const elements = selectors
        .map(selector => document.querySelector(selector))
        .filter(Boolean) as Element[];
      
      if (elements.length > 0) {
        resolve(elements);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve([]);
        return;
      }
      
      setTimeout(poll, interval);
    };
    
    poll();
  });
}

export function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const poll = () => {
      if (condition()) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(false);
        return;
      }
      
      setTimeout(poll, interval);
    };
    
    poll();
  });
}
