// Worker для обработки чанков в ParIter
declare var self: Worker;

interface WorkerData {
  chunk: any[];
  pipeline: any[];
  chunkIndex: number;
}

interface WorkerResult {
  chunkIndex: number;
  result: any[];
}

// Таблица функций для выполнения операций
const functionTable: { [key: number]: Function } = {};

// Обработчик сообщений от главного потока
self.onmessage = function(event: MessageEvent) {
  const { chunk, pipeline, chunkIndex } = event.data as WorkerData;
  
  try {
    // Обрабатываем чанк с применением pipeline
    let result = processChunk(chunk, pipeline);
    
    // Отправляем результат обратно
    const response: WorkerResult = {
      chunkIndex,
      result
    };
    
    (self as any).postMessage(response);
  } catch (error) {
    console.error('Error in worker:', error);
    (self as any).postMessage({
      chunkIndex,
      error: (error as Error).message,
      result: []
    });
  }
};

function processChunk(chunk: any[], pipeline: any[]): any[] {
  let result = [...chunk];
  
  for (const op of pipeline) {
    switch (op.type) {
      case "map":
        result = result.map((item, idx) => op.fn(item, idx));
        break;
      case "filter":
        result = result.filter((item, idx) => op.fn(item, idx));
        break;
      case "sum":
        // Суммируем числа в чанке
        result = [result.reduce((acc, val) => acc + Number(val), 0)];
        break;
      case "count":
        // Возвращаем количество элементов в чанке
        result = [result.length];
        break;
      case "reduce":
        // Применяем редукцию к чанку
        if (result.length > 0) {
          const reducer = op.fn;
          const reduced = result.reduce(reducer);
          result = [reduced];
        } else {
          result = [];
        }
        break;
      default:
        console.warn(`Unknown operation type: ${op.type}`);
    }
  }
  
  return result;
}