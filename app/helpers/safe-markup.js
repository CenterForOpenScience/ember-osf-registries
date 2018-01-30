import { htmlSafe } from '@ember/string';
import { helper } from '@ember/component/helper';

export function safeMarkup(params/* , hash */) {
    return htmlSafe(params.join(''));
}

export default helper(safeMarkup);
