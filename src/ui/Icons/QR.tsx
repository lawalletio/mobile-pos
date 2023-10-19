import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg width={30} height={30} fill="none" {...props}>
    <Path
      stroke={props.color}
      strokeWidth={2}
      d="M7 7h4v4H7zM19 7h4v4h-4zM7 19h4v4H7z"
    />
    <Path
      stroke={props.color}
      d="M6.5 14.5h1v1h-1zM10.5 14.5h1v1h-1zM14.5 14.5h1v1h-1zM14.5 18.5h1v1h-1zM14.5 22.5h1v1h-1zM14.5 10.5h1v1h-1zM14.5 6.5h1v1h-1zM18.5 14.5h1v1h-1zM22.5 14.5h1v1h-1zM18.5 18.5h1v1h-1zM22.5 18.5h1v1h-1zM18.5 22.5h1v1h-1zM22.5 22.5h1v1h-1z"
    />
  </Svg>
);
export default SvgComponent;
