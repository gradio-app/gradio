import Renderer, { RenderOptions } from '../Renderer';
import SlotTemplate from '../../nodes/SlotTemplate';
export default function (node: SlotTemplate, renderer: Renderer, options: RenderOptions & {
    slot_scopes: Map<any, any>;
}): void;
