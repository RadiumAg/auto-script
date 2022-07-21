import {
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
  MenuItem,
} from 'electron';
import { EScriptType } from './auto-script/type';
import { Config } from './config';

const platForm: MenuItemConstructorOptions[] = Object.values(EScriptType).map(
  script => ({
    label: script,
    type: 'radio',
    click(menuItem) {
      Config.setConfig({ scriptType: menuItem.label as EScriptType });
    },
  }),
);

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async buildMenu(): Promise<Menu> {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template = await this.buildDefaultTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  async buildDefaultTemplate() {
    const { scriptType } = await Config.getConfig();
    platForm.find(_ => _.label === scriptType).checked = true;

    const templateDefault: Array<MenuItemConstructorOptions | MenuItem> = [
      {
        label: '平台',
        submenu: platForm,
      },
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: () => {
              this.mainWindow.webContents.reload();
            },
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: () => {
              this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
            },
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: () => {
              this.mainWindow.webContents.toggleDevTools();
            },
          },
        ],
      },
      {
        label: '帮助',
        submenu: [
          {
            label: 'github',
            click() {
              shell.openExternal('https://github.com/RadiumAg');
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
