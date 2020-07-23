let fs = require('fs');
let cd = require('chromedriver');
let sd = require('selenium-webdriver');
let driver = new sd.Builder().forBrowser('chrome').build();
let path = require('path');

let c1file = process.argv[2];
let mfile = process.argv[3];    
let cname = process.argv[4];

let username, pwd;
let gcrsElement , gcrurl , gci=0 , gtextarea , gcontent ,gtestarea ,AllCourseElements;
let cFileWillBeReadPromise = fs.promises.readFile(c1file);


cFileWillBeReadPromise.then(function (content) {
    let credentials=JSON.parse(content);
    username=credentials.un;
    pwd=credentials.pwd;

    let loginpageWillBeloaded = driver.get("https://www.pepcoding.com/login");              //login
    return (loginpageWillBeloaded);

}).then(function () {
    let unWillBeFooundPromise = driver.findElement(sd.By.css("input[type=email]"));             //find email    
    return unWillBeFooundPromise;

}).then(function (unElement) {
    let usernameWillBeEntered = unElement.sendKeys(username);                               //enter email
    return usernameWillBeEntered;

}).then(function () {
    let passwordWillBeFoundPromise = driver.findElement(sd.By.css("input[type=password]"))          //find pwd
    return passwordWillBeFoundPromise;

}).then(function (pwdElemnt) {
    let pedWillBeEntered = pwdElemnt.sendKeys(pwd);                                         //enter pwd
    return pedWillBeEntered;
    
}).then(function () {
    let butonWillclickedPromised = driver.findElement(sd.By.css("button[type=submit"));             //find sign in
    return butonWillclickedPromised;

}).then(function(btbotton){
    let btnsubmitWillBeClicked=btbotton.click();                                               //click sign in
    return btnsubmitWillBeClicked;


}).then(function(){
    let RlinkWillBeFoundPromise=driver.wait(sd.until.elementLocated(sd.By.css('div.resource a')));          // wait for resourse
    return RlinkWillBeFoundPromise;

    // let crossButtonBeFound =driver.findElement(sd.By.className("red-text"));
    // return crossButtonBeFound;

}).then(function(RlinkElement){
    let RlinkWillBeReadPromise=RlinkElement.getAttribute('href');                                   // get href
    return RlinkWillBeReadPromise;
}).then(function(RPageURL){
    let RPageWillBeLoadedPromise=driver.get(RPageURL);                                              // enter resourse
    return RPageWillBeLoadedPromise;
})
// .then(function(){                                                                             //enter tpp by xpath
//     let TPPPageLoadPromise=driver.findElement(sd.By.xpath("/html/body/main/div[3]/div/div[1]/div/div/div[2]/div/div[2]/div[1]/div[3]")).click();
//     return TPPPageLoadPromise;
// })
.then(function(){
    let siteOverlayElementWillBFoundPromise=driver.findElement(sd.By.css("div#siteOverlay"));
    return siteOverlayElementWillBFoundPromise;
})
.then(function(soe){
    let waitForTOHidePromise=driver.wait(sd.until.elementIsNotVisible(soe),10000);
    return waitForTOHidePromise;
})
// .then(function(){
//     let TPPPageLoadPromise=driver.findElement(sd.By.css('courseName[text='The Placement Program']')).click();
//     return TPPPageLoadPromise;
// })
.then(function(){
    let courseElementWillBeFoundPromise=driver.findElements(sd.By.css('h2.courseInput'));
    return courseElementWillBeFoundPromise;
}).then(function(crsElement){
    
    gcrsElement=crsElement;
    let ceTextPromise=[];
    for(let i=0;i<gcrsElement.length;i++)
    {
        ceTextPromise.push(gcrsElement[i].getText());
    }

    let combinedTextPromiseForAllCOurseElement=Promise.all(ceTextPromise);
    return combinedTextPromiseForAllCOurseElement;


}).then(function(cetext){
    
    for(let i=0;i<cetext.length;i++)
    {
        if(cname===cetext[i])
        {
            gci=i;
            break;
        }
    }
    let courseElementWillBeClickedPromise=gcrsElement[gci].click();
    return courseElementWillBeClickedPromise;
}).then(function(){
    let urlWillBeREtrvedPromise=driver.getCurrentUrl();
    return urlWillBeREtrvedPromise;
}).then(function(url){
    gcrurl=url;
    let metadatFileWillBeReadPromise=fs.promises.readFile(mfile);
    return metadatFileWillBeReadPromise;

}).then(function(content){
    metadata=JSON.parse(content);
    // console.log(metadata);
    return Promise.resolve(true);              //even without writng this is default

}).then(function(){
    let pqp=solveQues(metadata.questions[0])
    for(let i=1;i<metadata.questions.length;i++)
    {
        pqp=pqp.then(function(){
            let cqp=solveQues(metadata.questions[i]);
            return cqp;
        })
    }
    return pqp;
})
.catch(function(err){
    console.log(err)
})
.finally(function(){
        // driver.quit();
})






function solveQues(question)
{
    return new Promise(function(resolve , reject){
        let quesWillBeFetchedPromie=getQuestionUrl(question);
        quesWillBeFetchedPromie.then(function(qurl){
           let quesWillBeLoadedPromise=driver.get(qurl);
           return quesWillBeLoadedPromise;
    
    }).then(function(){
        // identify editor
       
        let editorTabWillBeSelectedPromise=driver.findElement(sd.By.css(".editorTab .lang"));
        return editorTabWillBeSelectedPromise;

    }).then(function(editorTab){
        let editorWillBeClicked=editorTab.click();
        return editorWillBeClicked;

    }).then(function(){
        let textAreaWillBeSelected=driver.findElement(sd.By.css(".ace_text-input"));
        return textAreaWillBeSelected;
    }).then(function(textAreaElement){
            gtextarea=textAreaElement;
            let CtrlAPromise=textAreaElement.sendKeys(sd.Key.CONTROL +'a');
            return CtrlAPromise;

    }).then(function(){
        let delPromise=gtextarea.sendKeys(sd.Key.DELETE);
        return delPromise;

    }).then(function(){
        let codeFILEWillBeRead=fs.promises.readFile(path.join(question.path,"main.java"));
        return codeFILEWillBeRead;

    }).then(function(content){
        // 
        content = content + "";
        gcontent=content;
        let testcaseWillBeSelected=driver.findElement(sd.By.css("#customInput"));
        return testcaseWillBeSelected;

    }).then(function(testArea){
        gtestarea=testArea;
        let codeWillBeSUbmitted=gtestarea.sendKeys(gcontent);
        return codeWillBeSUbmitted;

    }).then(function(){
        let CtrlAWILLBEDONE=gtestarea.sendKeys(sd.Key.CONTROL+'a');
        return CtrlAWILLBEDONE;

    }).then(function(){
        let CtrlXWILLBEDONE=gtestarea.sendKeys(sd.Key.CONTROL+'x');
        return CtrlXWILLBEDONE;
    // }).then(function(){
    //     let textAreaWillBeSelected=driver.findElement(sd.By.css(".ace_text-input"));
    //     return textAreaWillBeSelected;

    }).then(function(content){
        
        let CtrlVWILLBEDONE=gtextarea.sendKeys(sd.Key.CONTROL+'v');
        return CtrlVWILLBEDONE;
    }).then(function(){
        
        let submitButtonWillBeClicked=driver.findElement(sd.By.css("#submitCode")).click();
        return submitButtonWillBeClicked;

    })
    .then(waitforOverlayToHide)
    .then(function(){
        
        let testcaseWillBeSelected=driver.findElements(sd.By.css("#testCases"));
        return testcaseWillBeSelected;

    }).then(function(testCasesRow){
        
        let multipleInputInROwArray=[];
        for(let i=0;i<testCasesRow.length;i++)
        {
            let MyParticularrowTestcasePromise=testCasesRow[i].findElements(sd.By.css("input[type=hidden]"));
            multipleInputInROwArray.push(MyParticularrowTestcasePromise);

        }
        return Promise.all(multipleInputInROwArray);
    }).then(function(everyRowInputs){
       
        let rowArr=[];
        for(let i=0;i<everyRowInputs.length;i++)
        {
            let inputtestCasePromise=everyRowInputs[i][0].getAttribute("value");
            let ExpectedtestCasePromise=everyRowInputs[i][1].getAttribute("value");
            let actualtestCasePromise=everyRowInputs[i][2].getAttribute("value");
            
        
        let AllinputValueOfROwPromise=Promise.all([inputtestCasePromise ,ExpectedtestCasePromise, actualtestCasePromise]);
        rowArr.push(AllinputValueOfROwPromise);
        }
        return Promise.all(rowArr);

    }).then(function (everyRowInputValues) {
        let objArray = everyRowInputValues.map(function (row) {
          let rowObj = {};
          rowObj.input = row[0];
          rowObj.expected = row[1];
          rowObj.actual = row[2];
          return rowObj;
        });
        let testCaseFileWillBeWrittenPromise = fs.promises.writeFile(path.join(question.path, "tc.json"),JSON.stringify(objArray));
        return testCaseFileWillBeWrittenPromise;
      
    }).then(function () {
        
        resolve();
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
    });
});
};

// abstraction
function getQuestionUrl(question) {
    return new Promise(function (resolve, reject) {
  
      if (question.url) {
        resolve(question.url);
      } else {
        reject();
      }
    });
  }
  


  function waitforOverlayToHide() {
    return new Promise(function (resolve, reject) {
      let siteOverlayElementWillBeFoundPromise = driver.findElement(
        sd.By.css("div#siteOverlay")
      );
      siteOverlayElementWillBeFoundPromise
        .then(function (soe) {
          let willWaitForSOToHidePromise = driver.wait(
            sd.until.elementIsNotVisible(soe),
            10000
          );
          return willWaitForSOToHidePromise;
        })
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    }); 
 
  }
//node 1tppact.js credentials.json metadata.json  "The Placement Program"