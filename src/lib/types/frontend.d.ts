type IAppearance = Partial<{
  sideMenuPinned: boolean;
  css: Partial<{
    '--background-color': string;
    '--other-background': string;
    '--background-hover': string;
    '--higher-color': string;
    '--text-color': string;
    '--link-color': string;
    '--link-hover': string;
  }>;
}>;
