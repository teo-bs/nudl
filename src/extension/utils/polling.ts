
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 10000,
  interval: number = 100
): Promise<boolean> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const check = () => {
      if (condition()) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(false);
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

export async function waitForElements(
  selectors: string[],
  timeout: number = 10000
): Promise<Element[]> {
  const elements: Element[] = [];
  
  await waitForCondition(() => {
    elements.length = 0;
    for (const selector of selectors) {
      const found = document.querySelectorAll(selector);
      elements.push(...Array.from(found));
    }
    return elements.length > 0;
  }, timeout);
  
  return elements;
}
