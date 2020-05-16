'use babel';

import CfScraperView from './cf-scraper-view';
import { CompositeDisposable } from 'atom';
import touch from 'touch'
import mkdirp from 'mkdirp'
import request from 'request'
import cheerio from 'cheerio'
export default {

  cfScraperView: null,
  modalPanel: null,
  subscriptions: null,
  lis:['A', 'B', 'C', 'D'],

  activate(state) {
    this.cfScraperView = new CfScraperView(state.cfScraperViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.cfScraperView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cf-scraper:fetch': () => this.fetch()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cfScraperView.destroy();
  },

  serialize() {
    return {
      cfScraperViewState: this.cfScraperView.serialize()
    };
  },

  createFile(path){
     touch.sync(path)
 },
 createDirectories(path) {
     try {
         mkdirp.sync(path);
         return 1;
     } catch (err) {
         if (err.code !== 'ENOENT') {
             throw err;
         }
     }
},
  fetch() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      folderPath = "C:/Users/aashu/Documents/CPP projects/SecondPhase/CodeForces/" + selection
      this.createDirectories(folderPath)
      atom.notifications.addSuccess('Folder ' + selection + ' Created')
      this.lis.forEach((folderName)=>{
         let questions = folderPath + '/' + folderName
         this.createDirectories(questions)
         atom.notifications.addSuccess('Folder ' + folderName + ' Created')
         this.download(selection, folderName).then((html) => {
            this.scrape(html, questions)
         }).catch((error) => {
           atom.notifications.addWarning(error.reason)
         })
      })

    }
  },


  scrape(html, questions){
     $ = cheerio.load(html)
     let all = $('div.input')
     console.log(all.contents())
     return 'Bella ciao'
 },

  download(contestNo, questionNo) {
    let url = 'https://codeforces.com/contest/' + contestNo + '/problem/' + questionNo
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body)
        } else {
          reject({
            reason: 'Unable to download page'
          })
        }
      })
    })
  }

};
