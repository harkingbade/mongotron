'use strict';
angular.module('app').factory('menuService', [
  '$window',
  '$rootScope',
  '$timeout',
  'dialogService',
  function($window, $rootScope, $timeout, dialogService) {
    const ipc = require('ipc');
    const shell = require('shell');
    const remote = require('remote');
    const Menu = remote.require('menu');
    const MenuItem = remote.require('menu-item');
    const appConfig = require('src/config/appConfig');

    function MenuService() {
      initMainMenu();
    }

    MenuService.prototype.showMenu = function(menuItems) {
      var menu = new Menu();

      for (let i = 0; i < menuItems.length; i++) {
        var menuItem = menuItems[i];

        if (!menuItem.label || !menuItem.click) {
          console.warn('MenuService - registerContextMenu - skipping menu item because it does not have either a label or a click function');
          continue;
        }

        menu.append(new MenuItem(menuItem));
      }

      menu.popup(remote.getCurrentWindow());
    };

    var mongotronMenu = {
      label: appConfig.name,
      submenu: [{
        label: 'About ' + appConfig.name,
        role: 'about'
      }, {
        type: 'separator'
      }, {
        label: 'Preferences...',
        accelerator: 'CmdOrCtrl+,',
        click: function() {
          $timeout(function() {
            $rootScope.showSettings();
          });
        }
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide ' + appConfig.name,
        accelerator: 'Command+H',
        role: 'hide'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      }, {
        label: 'Show All',
        role: 'unhide'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
          ipc.send('quit');
        }
      }, ]
    };

    var fileMenu = {
      label: 'File',
      submenu: [{
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: function() {
          $timeout(function() {
            dialogService.showSaveDialog()
              .then(function(fileNames) {
                console.log(fileNames);
              });
          });
        }
      }]
    };

    var editMenu = {
      label: 'Edit',
      submenu: [{
        label: 'Cut',
        accelerator: 'Cmd+X',
        selector: 'cut:'
      }, {
        label: 'Copy',
        accelerator: 'Cmd+C',
        selector: 'copy:'
      }, {
        label: 'Paste',
        accelerator: 'Cmd+V',
        selector: 'paste:'
      }, {
        label: 'Select All',
        accelerator: 'Cmd+A',
        selector: 'selectAll:'
      }]
    };

    var goMenu = {
      label: 'Go',
      submenu: [{
        label: 'Connection Manager',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: function() {
          $timeout(function() {
            $rootScope.showConnections('LIST');
          });
        }
      }, ]
    };

    var newMenu = {
      label: 'New',
      submenu: [{
        label: 'Connection',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: function() {
          $timeout(function() {
            $rootScope.showConnections('ADD');
          });
        }
      }, ]
    };

    var viewMenu = {
      label: 'View',
      submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      }, {
        label: 'Logs',
        accelerator: 'CmdOrCtrl+L',
        click: function() {
          $timeout(function() {
            $rootScope.showLogs();
          });
        }
      }, {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      }, {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      }, ]
    };

    var windowMenu = {
      label: 'Window',
      role: 'window',
      submenu: [{
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }, {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }, ]
    };

    var helpMenu = {
      label: 'Help',
      role: 'help',
      submenu: [{
        label: 'Learn More',
        click: function() {
          shell.openExternal(appConfig.repository);
        }
      }]
    };

    function initMainMenu() {
      var template = [
        mongotronMenu,
        fileMenu,
        editMenu,
        goMenu,
        newMenu,
        viewMenu,
        windowMenu,
        helpMenu
      ];

      if (process.platform === 'darwin') {
        // Window menu.
        template[3].submenu.push({
          type: 'separator'
        }, {
          label: 'Bring All to Front',
          role: 'front'
        });
      }

      var menu = Menu.buildFromTemplate(template);

      Menu.setApplicationMenu(menu);
    }

    return new MenuService();
  }
]);

angular.module('app').run([
  'menuService',
  function() {}
]);
