let fs = require("fs");
require("chromedriver");
let swd = require("selenium-webdriver");
let bldr = new swd.Builder();
let driver = bldr.forBrowser("chrome").build();
let path = require("path");
let cfile = process.argv[2];
let mfile = process.argv[3];
let cname = process.argv[4];

let userName, pwd, metadata;
let gcrsElements,
  gcrsi = 0,
  gcrsurl;
let gcodeArea, gContent, gtestArea;

let cfileWillBeReadPromise = fs.promises.readFile(cfile);
cfileWillBeReadPromise
  .then(function (content) {
    let credentials = JSON.parse(content);
    userName = credentials.un;
    pwd = credentials.pwd;
  })
  .then(function () {
    let toWillBeSetPromise = driver.manage().setTimeouts({
      implicit: 10000,
    });
    return toWillBeSetPromise;
  })
  .then(function () {
    let loginPageWillBeLoadedPromise = driver.get(
      "https://www.pepcoding.com/login"
    );
    return loginPageWillBeLoadedPromise;
  })
  .then(function () {
    let uneWillBeFoundPromise = driver.findElement(
      swd.By.css("input[type=email]")
    );
    let pwdeWillBeFoundPromise = driver.findElement(
      swd.By.css("input[type=password]")
    );
    let bothElementsWillBeFoundPromise = Promise.all([
      uneWillBeFoundPromise,
      pwdeWillBeFoundPromise,
    ]);
    return bothElementsWillBeFoundPromise;
  })
  .then(function (elements) {
    let userNameWillBeEnteredPromise = elements[0].sendKeys(userName);
    let pwdWillBeEnteredPromise = elements[1].sendKeys(pwd);
    let bothValuessWillBeEnteredPromise = Promise.all([
      userNameWillBeEnteredPromise,
      pwdWillBeEnteredPromise,
    ]);
    return bothValuessWillBeEnteredPromise;
  })
  .then(function () {
    let btnSubmitWillBeFoundPromise = driver.findElement(
      swd.By.css("button[type=submit]")
    );
    return btnSubmitWillBeFoundPromise;
  })
  .then(function (btnSubmit) {
    let btnSubmitWillBeClickedPromise = btnSubmit.click();
    return btnSubmitWillBeClickedPromise;
  })
  .then(function () {
    // s2 -> link ka wait karein, uska href read karein, aur driver.get kar jaien
    let waitForRLinkToBeLocatedPromise = driver.wait(
      swd.until.elementLocated(swd.By.css("div.resource a"))
    );
    return waitForRLinkToBeLocatedPromise;
  })
  .then(function (rlinkElement) {
    let rlinkHrefWillBeReadPromise = rlinkElement.getAttribute("href");
    return rlinkHrefWillBeReadPromise;
  })
  .then(function (rlinkhref) {
    let rPageWillBeLoadedPromise = driver.get(rlinkhref);
    return rPageWillBeLoadedPromise;
  })
  .then(waitforOverlayToHide)
  .then(function () {
    let courseElementsWillBeFoundPromise = driver.findElements(
      swd.By.css("h2.courseInput")
    );
    return courseElementsWillBeFoundPromise;
  })
  .then(function (crsElements) {
    gcrsElements = crsElements;

    let ceTextPromises = [];
    for (let i = 0; i < gcrsElements.length; i++) {
      ceTextPromises.push(gcrsElements[i].getText());
    }

    let combinedTextPromiseForAllCourseElements = Promise.all(ceTextPromises);
    return combinedTextPromiseForAllCourseElements;
  })
  .then(function (ceTexts) {
    for (let i = 0; i < ceTexts.length; i++) {
      if (cname === ceTexts[i]) {
        gcrsi = i;
        break;
      }
    }

    let courseElementWillBeClickedPromise = gcrsElements[gcrsi].click();
    return courseElementWillBeClickedPromise;
  })
  .then(function () {
    let urlWillBeRetrievedPromise = driver.getCurrentUrl();
    return urlWillBeRetrievedPromise;
  })
  .then(function (url) {
    gcrsurl = url;
    let metadataFileWillBeReadPromise = fs.promises.readFile(mfile);
    return metadataFileWillBeReadPromise;
  })
  .then(function (content) {
    metadata = JSON.parse(content);
    // console.log(metadata);
    return Promise.resolve(undefined); // even without writing this is a deafult
  })
  .then(function () {
    console.log(1);
    let pqp = solveQuestion(metadata.questions[0]);
    for (let i = 1; i < metadata.questions.length; i++) {
      pqp = pqp.then(function () {
        let cqp = solveQuestion(metadata.questions[i]);
        return cqp;
      });
    }
    return pqp;
  })
  .then(function () {
    console.log("well done");
  })
  .catch(function (err) {
    console.log(2);
    console.log(err);
  })
  .finally(function () {
    // driver.quit();
  });

function solveQuestion(question) {
  return new Promise(function (resolve, reject) {
    let questionUrlWillBeFetchedPromise = getQuestionUrl(question);
    questionUrlWillBeFetchedPromise
      .then(function (qurl) {
        // console.log(3);
        let questWillBeLoadedPromise = driver.get(qurl);
        return questWillBeLoadedPromise;
      })
      .then(function () {
        // identify editor
        let editorTabWillBeSelectedPromise = driver.findElement(
          swd.By.css(".editorTab .lang")
        );
        return editorTabWillBeSelectedPromise;
      })
      .then(function (editorTab) {
        let editorTabWillBeCLicked = editorTab.click();
        return editorTabWillBeCLicked;
      })
      .then(function () {
        let textAreaWillBeSelected = driver.findElement(
          swd.By.css(".ace_text-input")
        );
        return textAreaWillBeSelected;
      })
      //content remove
      .then(function (codeArea) {
        gcodeArea = codeArea;
        let CtrlAPromise = gcodeArea.sendKeys(swd.Key.CONTROL + "a");
        return CtrlAPromise;
      })
      .then(function () {
        let deletePromise = gcodeArea.sendKeys(swd.Key.DELETE);
        return deletePromise;
      })
      .then(function () {
        let codeFileWillBeRead = fs.promises.readFile(
          path.join(question.path, "main.java")
        );
        return codeFileWillBeRead;
      })
      .then(function (content) {
        content = content + "";
        gContent = content;
        let testCaseAreaWillBeSelected = driver.findElement(
          swd.By.css("#customInput")
        );
        return testCaseAreaWillBeSelected;
      })
      .then(function (testArea) {
        gtestArea = testArea;
        let codeWillBesubmittedPromise = testArea.sendKeys(gContent);
        return codeWillBesubmittedPromise;
      })
      .then(function () {
        let ctrlApromise = gtestArea.sendKeys(swd.Key.CONTROL + "a");
        return ctrlApromise;
      })
      .then(function () {
        let ctrlXpromise = gtestArea.sendKeys(swd.Key.CONTROL + "x");
        return ctrlXpromise;
      })
      .then(function () {
        let ctrlVPromiseInCodeArea = gcodeArea.sendKeys(swd.Key.CONTROL + "v");
        return ctrlVPromiseInCodeArea;
      })
      .then(function () {
        let submitbtnWillBeSelectedPromise = driver.findElement(
          swd.By.css("#submitCode")
        );
        return submitbtnWillBeSelectedPromise;
      })
      .then(function (submitbtn) {
        let submitBtnWillBeClickedPromise = submitbtn.click();
        return submitBtnWillBeClickedPromise;
      })
      .then(waitforOverlayToHide)
      // rows
      .then(function () {
        let testCaseRowsWillBeSelected = driver.findElements(
          swd.By.css("#testCases")
        );
        return testCaseRowsWillBeSelected;
      })
      // row => input
      .then(function (testCaseRows) {
        //
        let multipleInputsInARowPromisesArray = [];

        for (let i = 0; i < testCaseRows.length; i++) {
          let myParticularRowInputWillbeSlectedPromise = testCaseRows[
            i
          ].findElements(swd.By.css("input[type=hidden]"));

          multipleInputsInARowPromisesArray.push(
            myParticularRowInputWillbeSlectedPromise
          );
        }
        return Promise.all(multipleInputsInARowPromisesArray);
      })
      .then(function (everyRowAllinputs) {
        let rowArray = [];
        for (let i = 0; i < everyRowAllinputs.length; i++) {
          let inputTestCasePromise = everyRowAllinputs[i][0].getAttribute(
            "value"
          );
          let ExpectedOutputPromise = everyRowAllinputs[i][1].getAttribute(
            "value"
          );
          let ActualOutputPromise = everyRowAllinputs[i][2].getAttribute(
            "value"
          );

          //  // particular row inputs value
          let AllinputValueOfARowPromise = Promise.all([
            inputTestCasePromise,
            ExpectedOutputPromise,
            ActualOutputPromise,
          ]);
          // AllrowsInput value=> promise.all
          rowArray.push(AllinputValueOfARowPromise);
        }
        return Promise.all(rowArray);
      })

      .then(function (everyRowInputValues) {
        let objArray = everyRowInputValues.map(function (row) {
          let rowObj = {};
          rowObj.input = row[0];
          rowObj.expected = row[1];
          rowObj.actual = row[2];
          return rowObj;
        });
        let testCaseFileWillBeWrittenPromise = fs.promises.writeFile(
          path.join(question.path, "tc.json"),
          JSON.stringify(objArray)
        );
        return testCaseFileWillBeWrittenPromise;
      })
      .then(function () {})
      .then(function () {
        console.log("code submitted ");
      })

      //
      // then click the editor

      // identify
      //system upload => read
      // testcase area=>code
      // code editor
      // submit click
      // overlay wait
      // test case download
      // then click submit
      // then check status
      // then download test cases if required

      .then(function () {
        resolve();
      })
      .catch(function (err) {
        console.log(err);
        reject(err);
      });
  });
}
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
      swd.By.css("div#siteOverlay")
    );
    siteOverlayElementWillBeFoundPromise
      .then(function (soe) {
        let willWaitForSOToHidePromise = driver.wait(
          swd.until.elementIsNotVisible(soe),
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

// this will solve the question asynchronously and will return the promise to do so
// open the gcrsurl to restart for a question
// click the module
// then click the lecture
// then click the question

/*
// let courseElementWillBeFoundPromise = driver.findElement(swd.By.xpath(`//h2[text()[contains(.,\"${cname}\")]]`));
*/

/*
.then(function(){
    // s1 -> popup ka wait, popup ko dismiss karein, firr link ko find, firr click karein
    let popupDismissElementWillBeFoundPromise = driver.findElement(swd.By.css('h3.red-text'));
    return popupDismissElementWillBeFoundPromise;
}).then(function(popupDismissElement){
    let willWaitForPDEToBeVisiblePromise = driver.wait(swd.until.elementIsVisible(popupDismissElement));
    return willWaitForPDEToBeVisiblePromise;
}).then(function(popupDismissElement){
    let popupDismissElementWillBeClickedPromise = popupDismissElement.click();
    return popupDismissElementWillBeClickedPromise;
}).then(function(){
    let rlinkWillBeFoundPromise = driver.findElement(swd.By.css('div.resource a'));
    return rlinkWillBeFoundPromise;
}).then(function(rlinkElement){
    let rlinkElementWillBeClickedPromise = rlinkElement.click();
    return rlinkElementWillBeClickedPromise;
}).catch(function(err){
    console.log(err)
});*/
