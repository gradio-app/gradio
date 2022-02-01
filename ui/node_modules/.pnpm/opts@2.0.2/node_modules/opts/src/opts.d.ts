declare module 'opts' {
  export const version = '1.2.7'
  export function parse(opts :Opt[], args? :boolean|Arg[], help? :boolean) :void
  export function add (opts :Opt[], namespace? :string) :void
  export function get (flag :string) :string|true|undefined
  export function values () :{[flag :string] :string|true|undefined}
  export function args () :string[]
  export function arg (name :string) :string|undefined
  export function help () :void

  export interface Opt {
    readonly short? :string
    readonly long? :string
    readonly description? :string
    readonly value? :boolean
    readonly required? :boolean
    readonly callback? :(value :string|true)=>void
  }

  export interface Arg {
    readonly name? :string
    readonly required? :boolean
    readonly callback? :(value :string)=>void
  }
}
