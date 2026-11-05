import { PDFPlusModal } from 'modals';
import { normalizePath, Notice, Platform, Setting } from 'obsidian';
import { FuzzyFolderSuggest, getModifierNameInPlatform } from 'utils';
import { t, ui } from './../i18n/index';


export class DummyFileModal extends PDFPlusModal {
    static LOCAL_STORAGE_KEY = 'last-used-dummy-file-source';

    source: 'file' | 'web' | null = null;
    uris: string[] = [];
    // where to save the dummy files
    folderPath: string | null = null;

    constructor(...args: ConstructorParameters<typeof PDFPlusModal>) {
        super(...args);

        this.scope.register([], 'Enter', () => {
            if (activeDocument.activeElement?.tagName === 'INPUT') {
                this.submit();
            }
        });
    }

    onOpen() {
        super.onOpen();

        const lastUsedSource = this.plugin.loadLocalStorage(DummyFileModal.LOCAL_STORAGE_KEY);
        if (['file', 'web'].includes(lastUsedSource)) {
            this.source = lastUsedSource;
        }
        this.folderPath = this.lib.dummyFileManager.getFolderPathForDummyFiles(this.app.workspace.getActiveFile());

        this.titleEl.setText(ui("{0}: Create dummy file for external PDF", { 0: this.plugin.manifest.name }));
        this.modalEl.createDiv('', (div) => {
            new Setting(div).setDesc(createFragment((el) => {
                const keys = this.plugin.settings.modifierToDropExternalPDFToCreateDummy;
                el.appendText(ui("You can also use {0} drag & drop to create dummy files. ", { 0: keys.length ? (keys.map(getModifierNameInPlatform).join('+') + ' +') : '' }));
                el.createEl('a', { text: ui('Learn more about dummy PDF files'), href: 'https://ryotaushio.github.io/obsidian-pdf-plus/external-pdf-files' });
            }));
            setTimeout(() => {
                this.modalEl.insertBefore(div, this.contentEl);
            });
        });
        this.display();
    }

    display() {
        if (Platform.isDesktopApp) {
            this.displayDesktop();
        } else {
            this.displayMobile();
        }
    }

    displayDesktop() {
        this.contentEl.empty();

        this.addSourceLocationSetting();
        this.addFolderSetting();

        if (this.source === 'file') {
            this.addLocalFileSetting();
        } else if (this.source === 'web') {
            this.addWebFileSetting();
        }

        if (this.source) {
            this.addButtons();
        }
    }

    displayMobile() {
        this.source = 'web';
        this.contentEl.empty();
        this.addFolderSetting();
        this.addWebFileSetting();
        this.addButtons();
    }

    addSetting() {
        return new Setting(this.contentEl);
    }

    addSourceLocationSetting() {
        return this.addSetting()
            .setName(t('modal.source-location', 'Source location'))
            .setDesc(ui('Where the external PDF is located.'))
            .addDropdown((dropdown) => {
                dropdown
                    .addOptions({
                        'file': ui('On this computer'),
                        'web': ui('Web')
                    })
                    .setValue(this.source ?? '')
                    .onChange((value: 'file' | 'web') => {
                        this.source = value;
                        this.display();
                    });
                dropdown.selectEl.tabIndex = this.source ? -1 : 0;
            });
    }

    addFolderSetting() {
        return this.addSetting()
            .setName(t('modal.folder-to-save-dummy-files', 'Folder to save the dummy files'))
            .setDesc(createFragment((el) => {
                el.appendText(ui('You can specify the default folder in the '));
                el.createEl('a', { text: ui('settings'), href: 'obsidian://pdf-plus?setting=dummyFileFolderPath' });
                el.appendText(ui('.'));
            }))
            .addText((text) => {
                text.inputEl.size = 30;
                text.setValue(this.folderPath ?? '');
                new FuzzyFolderSuggest(this.app, text.inputEl)
                    .onSelect(({ item: folder }) => {
                        this.folderPath = folder.path;
                    });
            });
    }

    addLocalFileSetting() {
        this.addSetting()
            .setName(t('modal.absolute-path-to-pdf', 'Absolute path to the PDF'))
            .setDesc(ui('Type the path in the input box or click the "Browse" button to select the file.'))
            .addButton((button) => {
                button
                    .setButtonText(t('modal.browse', 'Browse'))
                    .setCta()
                    .onClick(() => {
                        // @ts-ignore
                        const paths: string[] | undefined = window.electron?.remote.dialog.showOpenDialogSync({
                            properties: ['openFile', 'multiSelections', 'dontAddToRecent'],
                            filters: [
                                { name: 'PDF files', extensions: ['pdf'] }
                            ]
                        });
                        if (paths && paths.length > 0) {
                            this.uris = paths.map((path) => this.lib.dummyFileManager.absolutePathToFileUri(path));
                            this.display();
                        }
                    });
            })
            .addExtraButton((button) => {
                button
                    .setIcon('plus')
                    .setTooltip(ui('Add another file'))
                    .onClick(() => {
                        this.uris.push('');
                        this.display();
                    });
            });

        this.addUriListSetting();
    }

    addWebFileSetting() {
        this.addSetting()
            .setName(t('modal.url-of-pdf', 'URL of the PDF'))
            .setDesc(ui('Must start with "https://" or "http://".'))
            .addExtraButton((button) => {
                button
                    .setIcon('plus')
                    .setTooltip(ui('Add another URL'))
                    .onClick(() => {
                        this.uris.push('');
                        this.display();
                    });
            });

        this.addUriListSetting();
    }

    addUriListSetting() {
        if (!this.uris.length) this.uris.push('');

        for (let i = 0; i < this.uris.length; i++) {
            this.addSetting()
                .then((setting) => setting.settingEl.addClass('no-border'))
                .addText((text) => {
                    text.inputEl.size = 30;
                    if (this.source === 'file') {
                        text.setValue(this.uris[i] ? this.uris[i].replace(/^file:\/\//, '') : '')
                            .onChange((value) => {
                                this.uris[i] = 'file://' + value;
                            });
                    } else {
                        text.setValue(this.uris[i] || '')
                            .onChange((value) => {
                                this.uris[i] = value;
                            });
                    }
                    // auto-focus the last input
                    if (i === this.uris.length - 1) {
                        setTimeout(() => text.inputEl.focus());
                    }
                })
                .addExtraButton((button) => {
                    button
                        .setIcon('trash')
                        .setTooltip(ui("Remove this {0}", { 0: this.source === 'file' ? ui('file') : 'URL' }))
                        .onClick(() => {
                            this.uris.splice(i, 1);
                            this.display();
                        });
                    if (this.uris.length === 1) {
                        button.extraSettingsEl.hide();
                    }
                });
        }
    }

    addButtons() {
        this.contentEl.createDiv('modal-button-container', (buttonContainerEl) => {
            buttonContainerEl.createEl('button', { text: t('modal.create', 'Create'), cls: 'mod-cta' }, (buttonEl) => {
                buttonEl.addEventListener('click', () => {
                    this.submit();
                });
            });

            buttonContainerEl.createEl('button', { text: t('modal.cancel', 'Cancel') }, (buttonEl) => {
                buttonEl.addEventListener('click', () => {
                    this.close();
                });
            });
        });
    }

    submit() {
        this.uris = this.uris.filter((uri) => uri);

        if (!this.uris.length) {
            new Notice(ui("{0}: The external PDF location is not specified.", { 0: this.plugin.manifest.name }));
            return;
        }
        if (!this.folderPath) {
            new Notice(ui("{0}: The folder to save the dummy files is not specified.", { 0: this.plugin.manifest.name }));
            return;
        }

        this.plugin.saveLocalStorage(DummyFileModal.LOCAL_STORAGE_KEY, this.source);

        this.createDummyFiles();
        this.close();
    }

    async createDummyFiles() {
        if (this.folderPath) {
            this.folderPath = normalizePath(this.folderPath);
            const files = await this.lib.dummyFileManager.createDummyFilesInFolder(this.folderPath, this.uris);
            new Notice(ui("{0}: Dummy files created successfully.", { 0: this.plugin.manifest.name }));

            for (const file of files) {
                if (file) {
                    const leaf = this.app.workspace.getLeaf(true);
                    await leaf.openFile(file);
                }
            }
        } else {
            new Notice(ui("{0}: Failed to create dummy files for the following URIs: {1}", { 0: this.plugin.manifest.name, 1: this.uris.join(', ') }));
        }
    }
}
