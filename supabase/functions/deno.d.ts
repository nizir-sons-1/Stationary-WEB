declare module "https://*" {
  const content: any;
  export default content;
  export const serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  export const createClient: any;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};
