/// <reference lib="webworker" />
import { solve, type AiRequest, type AiResponse } from './solve';

self.addEventListener('message', (event: MessageEvent<AiRequest>) => {
  const req = event.data;
  try {
    const move = solve(req);
    const res: AiResponse = { id: req.id, move };
    (self as unknown as Worker).postMessage(res);
  } catch (error) {
    const res: AiResponse = { id: req.id, move: null, error: String(error) };
    (self as unknown as Worker).postMessage(res);
  }
});
