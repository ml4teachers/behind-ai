// Typdeklaration für den Subpfad "react-plotly.js/factory".
// @types/react-plotly.js typisiert nur den Default-Export, nicht die Factory.
declare module 'react-plotly.js/factory' {
  import type { ComponentType } from 'react';
  import type { PlotParams } from 'react-plotly.js';
  const createPlotlyComponent: (plotly: unknown) => ComponentType<PlotParams>;
  export default createPlotlyComponent;
}
