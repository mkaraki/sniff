class DigAnswerEntry {
  name: string | undefined;
  type: number | undefined;
  ttl: number | undefined;
  data: string | undefined;
}

class DigAnswer {
  status: number | undefined;
  entries: Array<DigAnswerEntry> = [];
}

interface TextOutputStream {
  print: (value: string) => void;
  println: (value?: string | undefined) => void;
}

interface LowerApi {
  dig: (type: string, name: string) => Promise<DigAnswer>;
  stdout: TextOutputStream;
  stderr: TextOutputStream;
}

export {
  DigAnswerEntry,
  DigAnswer,
};

export type {
  TextOutputStream,
  LowerApi,
};