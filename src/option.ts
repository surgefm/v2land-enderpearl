export interface Option {
  userId?: string,
  reportBaseUrl: string;
  repositoryName: string;
  verbose?: boolean;
}

function optionThunk(): Option {
  return (window as any).__ENDERPEARL_OPTION__ as Option;
}

export default optionThunk;
