import { ui } from 'i18n';
import { ButtonComponent, Notice } from 'obsidian';

import { PDFPlusModal } from './base-modal';
import { t } from './../i18n/index';


export class RestoreDefaultModal extends PDFPlusModal {
    onOpen(): void {
        super.onOpen();
        this.containerEl.addClass('pdf-plus-restore-default-modal');
        this.titleEl.setText(ui("{0}: Restore default settings", { 0: this.plugin.manifest.name }));
        this.contentEl.createEl('p', {
            text: ui("This operation will overwrite your PDF++ config file ({0}). You may want to back up the file before proceeding.", { 0: (
                this.plugin.manifest.dir
                ?? (this.app.vault.configDir + '/plugins/' + this.plugin.manifest.id)
            ) + '/data.json' }),
        });

        this.contentEl.createDiv('modal-button-container', (el) => {
            new ButtonComponent(el)
                .setButtonText(t('modal.i-understand-restore', 'I understand, restore default settings'))
                .setWarning()
                .onClick(async () => {
                    await this.plugin.restoreDefaultSettings();
                    this.close();
                    new Notice(ui("{0}: Default setting restored. Note that some options require a restart to take effect.", { 0: this.plugin.manifest.name }), 6000);
                });
            new ButtonComponent(el)
                .setButtonText(t('modal.cancel', 'Cancel'))
                .onClick(() => {
                    this.close();
                });
        });

        setTimeout(() => {
            const activeEl = this.containerEl.doc.activeElement;
            if (activeEl && activeEl.instanceOf(HTMLButtonElement) && this.containerEl.contains(activeEl)) {
                // Avoid an accidental press of the button
                activeEl.blur();
            }
        });
    }
}
