import { TemplateNode } from '../../../interfaces';
import Component from '../../Component';
import ConstTag from '../ConstTag';
import { INodeAllowConstTag, INode } from '../interfaces';
export default function get_const_tags(children: TemplateNode[], component: Component, node: INodeAllowConstTag, parent: INode): [ConstTag[], Array<Exclude<INode, ConstTag>>];
