/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
'use strict';

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error('SUNEDITOR_MODULES a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function (window, noGlobal) {
    const dialog = {
        name: 'dialog',
        add: function (core) {
            const context = core.context;
            context.dialog = {
                kind: '',
                updateModal: false,
                _closeSignal: false
            };

            /** dialog */
            let dialog_div = core.util.createElement('DIV');
            dialog_div.className = 'se-dialog sun-editor-common';

            let dialog_back = core.util.createElement('DIV');
            dialog_back.className = 'se-dialog-back';
            dialog_back.style.display = 'none';

            let dialog_area = core.util.createElement('DIV');
            dialog_area.className = 'se-dialog-inner';
            dialog_area.style.display = 'none';

            dialog_div.appendChild(dialog_back);
            dialog_div.appendChild(dialog_area);

            context.dialog.modalArea = dialog_div;
            context.dialog.back = dialog_back;
            context.dialog.modal = dialog_area;

            /** add event listeners */
            context.dialog.modal.addEventListener('mousedown', this.onMouseDown_dialog.bind(core));
            context.dialog.modal.addEventListener('click', this.onClick_dialog.bind(core));
            
            /** append html */
            context.element.relative.appendChild(dialog_div);
            
            /** empty memory */
            dialog_div = null, dialog_back = null, dialog_area = null;
        },

        onMouseDown_dialog: function (e) {
            if (/se-dialog-inner/.test(e.target.className)) {
                this.context.dialog._closeSignal = true;
            } else {
                this.context.dialog._closeSignal = false;
            }
        },

        onClick_dialog: function (e) {
            e.stopPropagation();

            if (/close/.test(e.target.getAttribute('data-command')) || this.context.dialog._closeSignal) {
                this.plugins.dialog.close.call(this);
            }
        },

        open: function (kind, update)  {
            if (this.modalForm) return false;
            if (this.plugins.dialog._bindClose) {
                this._d.removeEventListener('keydown', this.plugins.dialog._bindClose);
                this.plugins.dialog._bindClose = null;
            }

            this.plugins.dialog._bindClose = function (e) {
                if (!/27/.test(e.keyCode)) return;
                this.plugins.dialog.close.call(this);
            }.bind(this);
            this._d.addEventListener('keydown', this.plugins.dialog._bindClose);

            this.context.dialog.updateModal = update;

            if (this.context.option.popupDisplay === 'full') {
                this.context.dialog.modalArea.style.position = 'fixed';
            } else {
                this.context.dialog.modalArea.style.position = 'absolute';
            }

            this.context.dialog.kind = kind;
            this.modalForm = this.context[kind].modal;
            const focusElement = this.context[kind].focusElement;

            if (typeof this.plugins[kind].on === 'function') this.plugins[kind].on.call(this, update);

            this.context.dialog.modalArea.style.display = 'block';
            this.context.dialog.back.style.display = 'block';
            this.context.dialog.modal.style.display = 'block';
            this.modalForm.style.display = 'block';

            if (focusElement) focusElement.focus();
        },

        _bindClose: null,
        close: function () {
            if (this.plugins.dialog._bindClose) {
                this._d.removeEventListener('keydown', this.plugins.dialog._bindClose);
                this.plugins.dialog._bindClose = null;
            }

            const kind = this.context.dialog.kind;
            this.modalForm.style.display = 'none';
            this.context.dialog.back.style.display = 'none';
            this.context.dialog.modalArea.style.display = 'none';
            this.context.dialog.updateModal = false;
            this.plugins[kind].init.call(this);
            this.context.dialog.kind = '';
            this.modalForm = null;
            this.focus();
        }
    };

    if (typeof noGlobal === typeof undefined) {
        if (!window.SUNEDITOR_MODULES) {
            window.SUNEDITOR_MODULES = {};
        }

        window.SUNEDITOR_MODULES.dialog = dialog;
    }

    return dialog;
}));