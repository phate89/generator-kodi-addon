'use strict';
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var helper = require('./validationHelper');

module.exports = yeoman.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the awesome ' + chalk.red('generator-kodi') + ' generator!'
    ));

    var prompts = [{
      type: 'list',
      name: 'type',
      message: 'Choose the type of addon you want to create.',
      choices: ['Contextmenu', 'Module', 'Plugin', 'Resource', 'Script', 'Service', 'Subtitle'],
      default: 0
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },
  askForAddonData: function () {
    var prompts = [];

    var kodiVersion = [{
      name: 'Krypton',
      value: '2.25.0'
    }, {
      name: 'Jarvis',
      value: '2.24.0'
    }];

    if (this.props.type == 'Contextmenu') {
      prompts.push({
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format context.name.name and not contain spaces. (for e.g. context.hello.menu)',
        validate: helper.validateContextmenuName
      });
    } else if (this.props.type == 'Module') {
      prompts.push({
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format script.module.name and not contain spaces. (for e.g. script.module.hello)',
        validate: helper.validateModuleName
      });
    } else if (this.props.type == 'Plugin') {
      prompts.push({
        type: 'checkbox',
        name: 'provides',
        message: 'Your addon will provide the following media types.',
        choices: ['audio', 'image', 'executable', 'video']
      }, {
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format plugin.name and not contain spaces. (for e.g. plugin.test.hello)',
        validate: helper.validatePluginName
      });
    } else if (this.props.type == 'Resource') {
      prompts.push({
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format resource.resourcetype.name and not contain spaces. (for e.g. resource.images.hello)',
        validate: helper.validateResourceName
      });
    } else if (this.props.type == 'Service') {
      prompts.push({
        type: 'list',
        name: 'start',
        message: 'Your service should start at:',
        choices: ['login', 'startup']
      }, {
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format service.name and not contain spaces. (for e.g. service.test.hello)',
        validate: helper.validateServiceName
      });
    } else if (this.props.type == 'Script') {
      prompts.push({
        type: 'checkbox',
        name: 'provides',
        message: 'Your addon will provide the following media types.',
        choices: ['audio', 'image', 'executable', 'video']
      }, {
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format script.name and not contain spaces. (for e.g. script.test.hello)',
        validate: helper.validateScriptName
      });
    } else if (this.props.type == 'Subtitle') {
      prompts.push({
        type: 'input',
        name: 'scriptid',
        message: 'Your addon id, it should be in the format service.subtitles.name and not contain spaces. (for e.g. service.subtitles.hello)',
        validate: helper.validateSubtitleName
      });
    }

    prompts.push({
      type: 'input',
      name: 'scriptname',
      message: 'Your addon name, it should be easily readable. (for e.g. Hello World)',
      validate: helper.validateScriptNameLength
    }, {
      type: 'list',
      name: 'kodiVersion',
      message: 'Choose the minimal Kodi Version your targeting.',
      choices: kodiVersion,
      default: 0
    }, {
      type: 'checkbox',
      name: 'platforms',
      message: 'Which platforms does this run with?',
      choices: ['all', 'android', 'linux', 'osx', 'windx']
    }, {
      type: 'list',
      name: 'license',
      message: 'Choose your license.',
      choices: require('generator-license').licenses,
      default: 0
    }, {
      type: 'input',
      name: 'authors',
      message: 'All author names? (seperated by ,)'
    }, {
      type: 'input',
      name: 'summary',
      message: 'What does your addon do?'
    }, {
      type: 'input',
      name: 'authorName',
      message: 'Your real name? We are using this for the license creation.'
    }, {
      type: 'input',
      name: 'email',
      message: 'Your email address? (for e.g. john.doe@gmail.com)'
    }, {
      type: 'input',
      name: 'website',
      message: 'Your website URL? (for e.g. www.kodi.tv)'
    });

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = Object.assign(this.props, props);
    }.bind(this));
  },

  default: function () {
    if (path.basename(this.destinationPath()) !== this.props.scriptid) {
      this.log(
        'Your generator must be inside a folder named ' + this.props.scriptid + '\n' +
        'I\'ll automatically create this folder.'
      );
      mkdirp(this.props.scriptid);
      this.destinationRoot(this.destinationPath(this.props.scriptid));
    }
  },

  writing: function () {
    this.fs.copyTpl(
      this.templatePath('addon.xml'),
      this.destinationPath('addon.xml'), {
        props: this.props,
        platforms: this.props.platforms === undefined ? this.props.platforms : this.props.platforms.toString().replace(/[,]/g, ' '),
        provides: this.props.provides === undefined ? this.props.provides : this.props.provides.toString().replace(/[,]/g, ' ')
      }
    );
    this.fs.copy(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore')
    );
    this.fs.copy(
      this.templatePath('changelog.txt'),
      this.destinationPath('changelog.txt')
    );
    this.fs.copy(
      this.templatePath('README.md'),
      this.destinationPath('README.md')
    );

    if (this.props.type == 'Contextmenu') {
      this.fs.copy(
        this.templatePath('context.py'),
        this.destinationPath('context.py')
      );
    } else if (this.props.type == 'Plugin') {
      this.fs.copy(
        this.templatePath('plugin.py'),
        this.destinationPath('plugin.py')
      );
    } else if (this.props.type == 'Script') {
      this.fs.copy(
        this.templatePath('script.py'),
        this.destinationPath('script.py')
      );
    } else if (this.props.type == 'Service') {
      this.fs.copy(
        this.templatePath('service.py'),
        this.destinationPath('service.py')
      );
    } else if (this.props.type == 'Subtitle') {
      this.fs.copy(
        this.templatePath('subtitle.py'),
        this.destinationPath('subtitle.py')
      );
    }

    if (this.props.type != 'Module' && this.props.type != 'Resource' && this.props.type != 'Contextmenu') {
      this.fs.copy(
        this.templatePath('tests/**'),
        this.destinationPath('tests/')
      );
    }

    if (this.props.type != 'Module' && this.props.type != 'Resource') {
      if (this.props.type == 'Contextmenu') {
        this.fs.copy(
        this.templatePath('resources/language/**'),
        this.destinationPath('resources/language/')
      );
      } else {
        this.fs.copyTpl(
        this.templatePath('resources/**'),
        this.destinationPath('resources/'), {
          props: this.props
        }
      );
      }
    }

    if (this.props.type == 'Resource') {
      mkdirp(this.destinationPath('resources/'));
    }

    this.composeWith(require.resolve('generator-license/app'), {
      name: this.props.authorName,
      email: this.props.email,
      website: this.props.website,
      license: this.props.license
    });
    this.composeWith(require.resolve('generator-git-init'), {
      commit: 'Created initial addon structure'
    });
  }
});
