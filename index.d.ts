// Type definitions for cors-gate 2.0

declare module 'cors-gate' {
  export default corsGate;
}

declare function corsGate(options: any): any;

declare namespace corsGate {
  function originFallbackToReferer(): any;

  function originFallbackToReferrer(): any;

}
