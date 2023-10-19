import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg width={30} height={30} fill="none" {...props}>
    <Path
      fill={props.color}
      fillRule="evenodd"
      d="M9.883 7c-.633 0-1.214.35-1.508.911l-3.029 5.764a2 2 0 0 0-.04 1.781l3.11 6.612c.267.569.839.932 1.467.932h13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-13Zm2.147 3.146a.5.5 0 0 1 .707 0l4.146 4.147 4.147-4.147a.5.5 0 0 1 .707.707L17.59 15l4.147 4.146a.5.5 0 1 1-.707.707l-4.147-4.146-4.146 4.146a.5.5 0 0 1-.707-.707L16.176 15l-4.146-4.146a.5.5 0 0 1 0-.708Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
