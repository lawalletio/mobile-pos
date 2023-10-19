import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg width={30} height={30} fill="none" {...props}>
    <Path
      fill={props.color}
      d="M7 10.5A1.5 1.5 0 0 1 8.5 9h13a1.5 1.5 0 0 1 1.5 1.5V12H7v-1.5Z"
    />
    <Path
      fill={props.color}
      fillRule="evenodd"
      d="M7 13h16v6.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 7 19.5V13Zm3 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm.5 1.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
