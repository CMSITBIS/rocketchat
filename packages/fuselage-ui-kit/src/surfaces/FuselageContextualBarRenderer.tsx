import * as UiKit from '@rocket.chat/ui-kit';

import ExperimentalTabNavigationBlock from '../blocks/ExperimentalTabNavigationBlock';
import { FuselageSurfaceRenderer } from './FuselageSurfaceRenderer';
import { ReactElement } from 'react';

export class FuselageContextualBarSurfaceRenderer extends FuselageSurfaceRenderer {
  public constructor() {
    super([
      'actions',
      'context',
      'divider',
      'image',
      'input',
      'section',
      'preview',
      'callout',
      'tab_navigation',
    ]);
  }

  tab_navigation(
    block: UiKit.ExperimentalTabNavigationBlock,
    context: UiKit.BlockContext,
    index: number): ReactElement | null {

    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <ExperimentalTabNavigationBlock
          key={index}
          block={block}
          context={context}
          index={index}
          surfaceRenderer={this}
        />
      );
    }

    return null;
  }
}
