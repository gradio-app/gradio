import TemplateScope from './shared/TemplateScope';
import AbstractBlock from './shared/AbstractBlock';
import AwaitBlock from './AwaitBlock';
import Component from '../Component';
import { TemplateNode } from '../../interfaces';
import ConstTag from './ConstTag';
export default class ThenBlock extends AbstractBlock {
    type: 'ThenBlock';
    scope: TemplateScope;
    const_tags: ConstTag[];
    constructor(component: Component, parent: AwaitBlock, scope: TemplateScope, info: TemplateNode);
}
