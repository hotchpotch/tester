'use babel';

/* @flow */

import { Emitter, CompositeDisposable } from 'atom';
import debounce from 'sb-debounce';
/* flow-include
import type { TextEditor, Disposable } from 'atom'
*/
import { subscriptiveObserve } from './helpers';

export default class EditorTester {
  /* ::
  editor: TextEditor;
  emitter: Emitter;
  subscriptions: CompositeDisposable;
  */

  constructor(editor/* : TextEditor*/) {
    if (!atom.workspace.isTextEditor(editor)) {
      return;
    }

    this.editor = editor;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(this.editor.onDidDestroy(() =>
      this.dispose(),
    ));
    this.subscriptions.add(this.editor.onDidSave(debounce(() =>
      this.emitter.emit('should-test', false),
    ), 16, true));
    this.subscriptions.add(subscriptiveObserve(atom.config, 'tester.testOnChangeInterval', interval =>
      this.editor.getBuffer().onDidChange(debounce(() => {
        this.emitter.emit('should-test', true);
      }, interval * 1000)),
    ));
  }
  getEditor()/* : TextEditor*/ {
    return this.editor;
  }
  test(onChange/* : boolean = false*/) {
    this.emitter.emit('should-test', onChange);
  }
  onShouldTest(callback/* : Function*/)/* : Disposable*/ {
    return this.emitter.on('should-test', callback);
  }
  onDidDestroy(callback/* : Function*/)/* : Disposable*/ {
    return this.emitter.on('did-destroy', callback);
  }
  dispose() {
    this.emitter.emit('did-destroy');
    this.subscriptions.dispose();
    this.emitter.dispose();
  }
}
