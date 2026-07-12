export { capTrace } from './capTrace.js';

import { adaptArrayTrace } from './sortingSearchingAdapter.js';
import { adaptRecursionTrace } from './recursionAdapter.js';
import { adaptLinkedListTrace } from './linkedListAdapter.js';
import { adaptStackQueueTrace } from './stackQueueAdapter.js';
import { adaptTreeTrace } from './treeAdapter.js';
import { adaptGraphTrace } from './graphAdapter.js';
import { adaptDpTrace } from './dpAdapter.js';
import { adaptVariableInspectorTrace } from './variableInspectorAdapter.js';

const ADAPTERS_BY_CATEGORY = {
  sorting: adaptArrayTrace,
  searching: adaptArrayTrace,
  recursion: adaptRecursionTrace,
  'linked-list': adaptLinkedListTrace,
  'stack-queue': adaptStackQueueTrace,
  tree: adaptTreeTrace,
  graph: adaptGraphTrace,
  dp: adaptDpTrace,
};

export function adaptTrace(category, trace) {
  const adapter = category ? ADAPTERS_BY_CATEGORY[category] : null;
  const result = adapter ? adapter(trace) : null;

  if (result && result.length > 0) {
    return { frames: result, visualizer: category };
  }
  return { frames: adaptVariableInspectorTrace(trace), visualizer: 'variable-inspector' };
}
