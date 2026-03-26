export type ActionResponse = {
  ok: boolean;
  message: string;
};

export const success = (message: string): ActionResponse => ({ ok: true, message });
export const failure = (message: string): ActionResponse => ({ ok: false, message });
