// @flow strict
import CMS from 'netlify-cms-app';
import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader';
import PagePreview from './preview-templates/page-preview';
import PostPreview from './preview-templates/post-preview';

deckDeckGoHighlightElement();
CMS.registerPreviewTemplate('pages', PagePreview);
CMS.registerPreviewTemplate('posts', PostPreview);
