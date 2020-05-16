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
     // touch.sync(path)
     return 'ibne ba tuta'
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
            atom.notifications.addSuccess('All the input and output files were added successfully')

         }).catch((error) => {
           atom.notifications.addWarning(error.reason)
         })
      })

    }
  },


  scrape(html, questions){
     $ = cheerio.load(html)
     //INPUT FILES
     $('div.input pre').each(function(i, elem) {
        let num = i + 1
        let inputFile  = questions + '/' + 'input' + num + '.txt'
        var fs = require('fs')
        touch.sync(inputFile)
        fs.writeFile(inputFile, $(this).text(), function(error){
           if(error){
             console.log('Something happened!! :(')
          }
      });
     })
     //OUTPUT FILES
     $('div.output pre').each(function(i, elem) {
       let num = i + 1
       let outputFile  = questions + '/' + 'output' + num + '.txt'
       var fs = require('fs')
       touch.sync(outputFile)
       fs.writeFile(outputFile, $(this).text(), function(error){
          if(error){
             atom.notifications.addError('Something bad happened!! :(')
          }
     });
     })
     //MYOUTPUT FILE
     touch.sync(questions + '/myOutput.txt')

     //ANS.cpp
     let ansFile = questions + '/ans.cpp'
     let template = 'C:/Users/aashu/Documents/CPP projects/my_coding_template.cpp'
     touch.sync(ansFile)
     var fs = require('fs')
     let pasteText;
     fs.readFile(template, function(err, data){
        if(err){
           atom.notifications.addError('Something real bad happened!! :(')
        }
        pasteText = data.toString();
        fs.writeFile(ansFile, pasteText, function(error){
           if(error){
             atom.notifications.addError('Something really really bad happened!! :(')
           }
        });
     });
     console.log(pasteText)

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
