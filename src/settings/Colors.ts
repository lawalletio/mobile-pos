export type GeneralScheme = {
  black: string;
  white: string;
};

export type Color = {
  // brand
  primary: string;
  primary15: string;
  secondary: string;
  terciary: string;
  // grays
  black: string;
  gray5: any;
  gray15: string;
  gray25: string;
  gray35: string;
  white: string;
  // validations
  error: string;
  success: string;
  // general
  background: string;
  text: string;
  // delete
  solid: string;
  lightGray: string;
  ultrLightGray: string;
  light: string;
  card: string;
};

export type ButtonColor = 'primary' | 'secondary' | 'terciary' | 'solid';

export type ColorScheme = {
  dark: Color;
  light: Color;
};

export const General: GeneralScheme = {
  black: '#111111',
  white: '#F3F3F3',
};

// CSS Hexadecimal RGBA
// Link: https://stackoverflow.com/a/8254129

export const Colors: ColorScheme = {
  dark: {
    // brand
    primary: '#B3E0B8',
    primary15: '#B3E0B826',
    secondary: '#F5C365',
    terciary: '#DBA2A3',
    // grays
    black: General.black,
    gray5: `${General.white}0C`,
    gray15: `${General.white}26`,
    gray25: `${General.white}3F`,
    gray35: `${General.white}59`,
    white: General.white,
    // validations
    error: '#FF7070',
    success: '#92C988',
    // general
    background: General.black,
    text: General.white,
    // delete
    solid: '#F3F3F3',
    light: '#7D7D7D',
    lightGray: '#2C2C2C',
    ultrLightGray: '#1F1F1F',
    card: '#1F1F1F',
  },
  light: {
    // brand
    primary: '#4AB556',
    primary15: '#4AB55626',
    secondary: '#EFA210',
    terciary: '#B84749',
    // grays
    black: General.black,
    gray5: `${General.black}0C`,
    gray15: `${General.black}26`,
    gray25: `${General.black}3F`,
    gray35: `${General.black}59`,
    white: General.white,
    // validation
    success: '#72B965',
    error: '#FF3D3D',
    // general
    background: General.white,
    text: General.black,
    // delete
    solid: '#111111',
    light: '#E6E6E6',
    lightGray: '#CCCCCC',
    ultrLightGray: '#808080',
    card: '#BFBFBF',
  },
};
