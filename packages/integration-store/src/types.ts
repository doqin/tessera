export interface ToolCall {
  id: string;
  name: string;
  params: Record<string, unknown>;
  result?: unknown;
  calledAt: string;
}

export interface NavState {
  currentRoute: string;
}
