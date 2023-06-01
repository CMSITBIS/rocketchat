import * as UiKit from '@rocket.chat/ui-kit';
import { parse } from '@rocket.chat/message-parser';
import type { ReactElement } from 'react';
import { Fragment } from 'react';
import { Markup } from '@rocket.chat/gazzodown';

import ActionsBlock from '../blocks/ActionsBlock';
import ContextBlock from '../blocks/ContextBlock';
import DividerBlock from '../blocks/DividerBlock';
import ImageBlock from '../blocks/ImageBlock';
import InputBlock from '../blocks/InputBlock';
import PreviewBlock from '../blocks/PreviewBlock';
import SectionBlock from '../blocks/SectionBlock';
import ButtonElement from '../elements/ButtonElement';
import DatePickerElement from '../elements/DatePickerElement';
import ImageElement from '../elements/ImageElement';
import LinearScaleElement from '../elements/LinearScaleElement';
import MultiStaticSelectElement from '../elements/MultiStaticSelectElement';
import OverflowElement from '../elements/OverflowElement';
import PlainTextInputElement from '../elements/PlainTextInputElement';
import StaticSelectElement from '../elements/StaticSelectElement';
import I18nTextElement from '../elements/I18nTextElement';

export type FuselageSurfaceRendererProps = ConstructorParameters<
  typeof UiKit.SurfaceRenderer
>[0];

export class FuselageSurfaceRenderer extends UiKit.SurfaceRenderer<ReactElement> {
  public constructor(allowedBlocks?: FuselageSurfaceRendererProps) {
    super(
      allowedBlocks || [
        'actions',
        'context',
        'divider',
        'image',
        'input',
        'section',
        'preview',
      ]
    );
  }

  public plain_text(
    { text = '' }: UiKit.PlainText,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return text ? <Fragment key={index}>{text}</Fragment> : null;
  }

  public i18n(
    { key = '' }: UiKit.I18n,
    context: UiKit.BlockContext,
    index: number,
    appId?: string
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK || !appId) {
      return null;
    }

    return key ? (
      <I18nTextElement key={index} appId={appId} i18nKey={key} />
    ) : null;
  }

  public mrkdwn(
    { text = '' }: UiKit.Markdown,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return text ? (
      <Markup key={index} tokens={parse(text, { emoticons: false })} />
    ) : null;
  }

  public text(
    textObject: UiKit.TextObject,
    context: UiKit.BlockContext,
    index: number,
    appId?: string
  ): ReactElement | null {
    if (textObject.type === 'mrkdwn') {
      return this.mrkdwn(textObject, context, index);
    }

    if (textObject.type === 'i18n') {
      return this.i18n(textObject, context, index, appId);
    }

    return this.plain_text(textObject, context, index);
  }

  actions(
    block: UiKit.ActionsBlock,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <ActionsBlock
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

  preview(
    block: UiKit.PreviewBlock,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context !== UiKit.BlockContext.BLOCK) {
      return null;
    }
    return (
      <PreviewBlock
        key={index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  context(
    block: UiKit.ContextBlock,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <ContextBlock
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

  divider(
    block: UiKit.DividerBlock,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <DividerBlock
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

  image(
    block: UiKit.ImageBlock | UiKit.ImageElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <ImageBlock
          key={index}
          block={block}
          context={context}
          index={index}
          surfaceRenderer={this}
        />
      );
    }

    return (
      <ImageElement
        key={index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  input(
    block: UiKit.InputBlock,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <InputBlock
          key={block.element.actionId || index}
          block={block}
          context={context}
          index={index}
          surfaceRenderer={this}
        />
      );
    }

    return null;
  }

  section(
    block: UiKit.SectionBlock,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return (
        <SectionBlock
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

  button(
    block: UiKit.ButtonElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <ButtonElement
        key={index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  datepicker(
    block: UiKit.DatePickerElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <DatePickerElement
        key={block.actionId || index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  static_select(
    block: UiKit.StaticSelectElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <StaticSelectElement
        key={block.actionId || index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  multi_static_select(
    block: UiKit.MultiStaticSelectElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <MultiStaticSelectElement
        key={block.actionId || index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  overflow(
    block: UiKit.OverflowElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <OverflowElement
        key={index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  plain_text_input(
    block: UiKit.PlainTextInputElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <PlainTextInputElement
        key={block.actionId || index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }

  linear_scale(
    block: UiKit.LinearScaleElement,
    context: UiKit.BlockContext,
    index: number
  ): ReactElement | null {
    if (context === UiKit.BlockContext.BLOCK) {
      return null;
    }

    return (
      <LinearScaleElement
        key={block.actionId || index}
        block={block}
        context={context}
        index={index}
        surfaceRenderer={this}
      />
    );
  }
}
