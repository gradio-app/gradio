import Wrapper from './shared/Wrapper';
import Renderer from '../Renderer';
import Block from '../Block';
import FragmentWrapper from './Fragment';
import InlineComponentWrapper from './InlineComponent';
import SlotTemplate from '../../nodes/SlotTemplate';
export default class SlotTemplateWrapper extends Wrapper {
    node: SlotTemplate;
    fragment: FragmentWrapper;
    block: Block;
    parent: InlineComponentWrapper;
    constructor(renderer: Renderer, block: Block, parent: Wrapper, node: SlotTemplate, strip_whitespace: boolean, next_sibling: Wrapper);
    render(): void;
    render_get_context(): void;
}
