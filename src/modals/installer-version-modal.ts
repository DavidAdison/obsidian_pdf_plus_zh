import { ui } from 'i18n';
import { ButtonComponent, requireApiVersion } from 'obsidian';

import PDFPlus from 'main';
import { PDFPlusModal } from './base-modal';
import { getInstallerVersion, isVersionOlderThan } from 'utils';
import { t } from './../i18n/index';


// See https://github.com/RyotaUshio/obsidian-pdf-plus/issues/395#issuecomment-2680378913
const minInstallerVersion = '1.6.5';

export class InstallerVersionModal extends PDFPlusModal {
    static openIfNecessary(plugin: PDFPlus) {
        const installerVersion = getInstallerVersion();
        if (installerVersion && isVersionOlderThan(installerVersion, minInstallerVersion)) {
            plugin.app.workspace.onLayoutReady(() => {
                new InstallerVersionModal(plugin).open();
            });
        }
    }

    onOpen() {
        super.onOpen();

        const name = this.plugin.manifest.name;
        this.setTitle(ui("{0}: Obsidian installer update is required", { 0: name }));
        this.contentEl.createEl('p', {
            text: ui("Your Obsidian installer ({0}) is outdated and is incompatible with the latest {1}. Please download the latest installer from Obsidian's website and re-install the Obsidian app.", { 0: getInstallerVersion(), 1: name }),
        });

        if (!requireApiVersion(minInstallerVersion)) {
            this.contentEl.createEl('p', {
                text: ui("Also, in the very near future, Obsidian {0} or later will be required for you to be able to keep receiving updates of {1}.", { 0: minInstallerVersion, 1: name }),
            });
        }

        this.contentEl.createDiv('modal-button-container', (el) => {
            const downloadUrl = 'https://obsidian.md/download';
            new ButtonComponent(el)
                .setButtonText(ui('Get installer from obsidian.md'))
                .setTooltip(downloadUrl)
                .setCta()
                .onClick(() => {
                    window.open(downloadUrl);
                });

            const helpUrl = 'https://help.obsidian.md/Getting+started/Update+Obsidian#Installer%20updates';
            new ButtonComponent(el)
                .setButtonText(ui('What is "installer update"? (help.obsidian.md)'))
                .setTooltip(helpUrl)
                .onClick(() => {
                    window.open(helpUrl);
                });
        });
    }
}
