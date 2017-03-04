var os = require('os');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var child_process = require('child_process');
var children  = [];
var kill = require('tree-kill');
var terminate = require('terminate');
var app = require('electron').remote.app;
var path = app.getAppPath();
var AutoLaunch = require('auto-launch');
var mixpanel = require('mixpanel');
var pjson = require('./package.json');
var poloniex = ("https://poloniex.com/public?command=returnTicker")
var system = require('@paulcbetts/system-idle-time/addon')
var titleList = $.getJSON(poloniex);
var gpu = 'None'
var runclock = 0
var balance2 = -1;
var addr = localStorage.Email;
var card = localStorage.card;
// var minimize = localStorage.minimize;
var launch = localStorage.launch;
var launchmine = localStorage.launchmine;
var notLaunching = localStorage.notLaunching;
var charity = localStorage.charity
var idleTriggerFlag = false
var userMiningClick = false
var runIdleOptionFlag = (localStorage.runIdleOptionFlag == 'true')? true: false
if (runIdleOptionFlag == true) {
  document.getElementById('RunWhenIdle').click();
}
var childRef = null

var mixpanel = mixpanel.init('ee2c2f6680b70ab5799fedd0bc0ff982');

if (addr == null || addr == "") {
  console.log(addr)
  console.log("First Time Setup")

}

var mixpanelmining = function() {
  mixpanelmining = function() {};
  mixpanel.track("GPU STARTED", {
    distinct_id: addr,
    graphics_card: card,
    launch: launch,
    launch_mine: launchmine,
    not_launching: notLaunching,
    charity: charity,
    idleTriggerFlag: runIdleOptionFlag,
    verision: pjson.version,
    cpu_cores: navigator.hardwareConcurrency,
    gpu: savegpu,
    balance: balance.toFixed(2),
  });
  mixpanel.people.set(addr, {
    $first_name: "",
    $last_name: "",
    $email: addr,
    balance: balance.toFixed(2),
    gpu: gpu,
    cpu_cores: navigator.hardwareConcurrency,
    verision: pjson.version
  }); //sets explore mixpanel data
}

function mxupdate() {
  mixpanel.track("Updated", {
    distinct_id: addr,
    verision: pjson.version
  });
}



var appLauncher = new AutoLaunch({
  name: 'SteamPool',
});

if (addr !== 'undefined' && addr !== null && addr !== undefined && addr !== "") {
  document.getElementById('emailField').value = addr;
  /*  if (minimize == 'true') {
        document.getElementById('MinToTask').click();
        console.log('minimize')
    } */

  // Sets Textbox values
  if (charity == 'true') {
    document.getElementById('charity').click();
  }

  if (launch == 'true') {
    document.getElementById('LaunchOnBoot').click();
    appLauncher.enable(function(err) {});
  }
  if (launchmine == 'true') {
    document.getElementById('LaunchAndMine').click();
    appLauncher.enable(function(err) {});
    setTimeout(mine, 1000);
  }

  if (notLaunching == 'true') {
    document.getElementById('noLaunch').click();
    appLauncher.disable(function(err) {});
  }

} else {
  document.getElementById('emailField').value = "";
  document.getElementById('LaunchOnBoot').checked = true;
  console.log('Email is undefined')
};

function settings() {
  console.log('settingsrunning')
  var launch = document.getElementById('LaunchOnBoot').checked;
  localStorage.launch = (launch);
  var launchmine = document.getElementById('LaunchAndMine').checked;
  localStorage.launchmine = (launchmine);
  var notLaunching = document.getElementById('noLaunch').checked;
  localStorage.notLaunching = (notLaunching);
  var charity = document.getElementById('charity').checked;
  localStorage.charity = (charity);

  if ($('input.charity').is(':checked')) {
    console.log('Charity')
    var charity = true;
    console.log(charity)
  }
  if ($('input.launch').is(':checked')) {
    console.log('Launch')
    appLauncher.enable(function(err) {});
  }
  if ($('input.launchmine').is(':checked')) {
    console.log('Launch and Run')
    appLauncher.enable(function(err) {});
  }

  if ($('input.nolaunch').is(':checked')) {
    console.log('Not Launching')
    appLauncher.disable(function(err) {});
  }
}

function progressbar() {
  var url = "http://144.217.30.48:8089/api/users/" + addr + "/balance";
  $.get(url, function(body) {
    var btcbalance = body;
    $.get("https://api.bitcoinaverage.com/ticker/USD/last", function(body) {
      var btcusd = body;
      var usdValue = btcusd * btcbalance;
      window.balance = usdValue; //20 is 100/20 which gives us 5 our base payout
      if (balance2 > 0) {
        if (balance < balance2) {
          balance = balance2;
        } else {
          balance = balance;
        }
      }
      var progressbarbalance = balance * 100;
      $('.progress-bar').css('width', progressbarbalance + '%').attr('aria-valuenow', progressbarbalance);
      $('.show').text("$" + balance.toFixed(4) + " Estimated Earnings");
      if (balance > 1) {
        $('.show').text("$" + balance.toFixed(4) + " Request a Payout in the Cashout Tab!");
        $('.progress-bar').removeClass('active');
        $('.progress-bar').removeClass("progress-bar-success").addClass("progress-bar-info");
        payout()
      }
      balance2 = balance;
    });
  })
}

var payout = function() {
  payout = function() {};
  mixpanel.track("Balance Ready for Payout", {
    distinct_id: addr,
    balance: balance.toFixed(2),
    gpu: gpu,
    verision: pjson.version
  });

}

exports.init = function() {
  progressbar();
  setInterval(progressbar, 1000 * 60 * 0.3);
  setInterval(startMiningIfIdle, 10000);  // check every 10 seconds whether the idleTime is more than 20 mins
}

function startMiningIfIdle() {
  if (!runIdleOptionFlag && !idleTriggerFlag)
    return
  var idleTime = system.getIdleTime()
  // console.log('idle time: ' + idleTime)
  if ((idleTime > 20 * 60 * 1000) && !idleTriggerFlag && !userMiningClick) {
    // if user has been inactive more than 10 seconds AND mining hasn't already been triggered
    // AND user hasn't clicked the mining button manually
    mine()
    idleTriggerFlag = true
  } else if ((idleTime < 20 * 60 * 1000) && idleTriggerFlag && !userMiningClick) {
    // if mining had been triggered due to inactivity and now user is active again
    // AND user hasn't clicked the mining button manually
    stopMining()
    childRef.kill('SIGINT')  // manually kill the child incase it keeps running
    idleTriggerFlag = false
  }
}



function mine() {
  var startButtontext = document.getElementById('startButton').innerHTML
  if (startButtontext == "START") {
    console.log('Starting Program')
    startMining();
    setInterval(resetDag, 1000 * 60 * 60 * 4);
    progressbar();
    setInterval(trackMine, 1000 * 60 * 60 * 4); //sends to server every 4 hours
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var validateEmail = re.test(addr);
    save()
    if (addr == 'undefined' || addr == null || addr == undefined || addr == "") {
      alert("Email field must be filled out");
      stopMining();
    } else if (validateEmail === false) {
      alert("Email is invalid");
      stopMining();
    } else {
      spawnChild();
      setTimeout(setspeed, 10000);
    }
    if (card == 'No :(') {
      mixpanelstart()
    };
  } else {
    stopMining();
  }
};

function trackMine() {
  mixpanel.track("Currently Mining", {
    distinct_id: addr,
    balance: balance.toFixed(2),
  });
  console.log('trackmine')
}


function startMining() {
  $('.progress-bar').removeClass("progress-bar-success").addClass("progress-bar-warning");
  startButton.style.backgroundColor = '#FFA500';
  startButton.style.border = '#FFA500';
  settingsButton.style.backgroundColor = '#FFA500';
  settingsButton.style.border = '#FFA500';
  var newaddr = document.getElementById('emailField').value;
  addr = newaddr.replace(/\s+/g, '').trim().toLowerCase(); //Trims off any extra spaces in emailField and sets all to lowercase
  console.log(addr)
  localStorage.Email = ('emailField', addr);
  //  var minimize = document.getElementById('MinToTask').checked;
  //  localStorage.minimize = (minimize);
  var charity = document.getElementById('charity').checked;
  localStorage.charity = (charity);
  var launch = document.getElementById('LaunchOnBoot').checked;
  localStorage.launch = (launch);
  var launchmine = document.getElementById('LaunchAndMine').checked;
  localStorage.launchmine = (launchmine);
  var notLaunching = document.getElementById('noLaunch').checked;
  localStorage.notLaunching = (notLaunching);
  document.getElementById("startButton").innerHTML = "RUNNING, CLICK TO ABORT";
  document.getElementById("emailField").disabled = true;
  if ($('input.launch').is(':checked')) {
    console.log('Launch')
    appLauncher.enable(function(err) {});
  }
  if ($('input.launchmine').is(':checked')) {
    console.log('Launch and Run')
    appLauncher.enable(function(err) {});
  }

  if ($('input.nolaunch').is(':checked')) {
    console.log('Not Launching')
    appLauncher.disable(function(err) {});
  }

};

function resetDag() {
  var dag = "CD %LocalAppData%/Ethash && DEL F*"; // Deletes all Dag Files incase they become corrupt
  var childbes = exec(dag, function(error, stdout, stderr) {
    // command output is in stdout
  });
  childbes.stdout.on('data', function(d) {})

}


function spawnChild() {
  var addr = localStorage.getItem('Email');
  var startButtontext = document.getElementById('startButton').innerHTML
  var exePath = path + '/SteamPool.exe';
  console.log(runclock)
  var i = 0
  if (runclock == 1) {
    console.log('Using Secondary GPU')
    var args = ['-F', '144.217.30.48:8088/' + addr, '-G', '--opencl-platform', '1'];

  } else {
      console.log('Using Primary GPU')
      var args = ['-F', '144.217.30.48:8088/' + addr, '-G', '--opencl-platform', '0'];
    }
    console.log(args)

  var child = spawn(exePath, args);
  childRef = child
  console.log('child spawned with pid: ' + child.pid)
  child.stdout.on('data', function(d) {
    if (d.toString().includes("OPENCL")) {
      var dagCreation = d.toString().substring(10,13);
      document.getElementById("startButton").innerHTML = "STARTING UP: " + dagCreation;
    }
    console.log(d.toString());
  });
  child.stderr.on('data', function(d) {
    var gpu = d.toString().replace('Found suitable OpenCL device ', '')
    if (gpu.includes("Intel")) {
      console.log('Intel card found')
      runclock = 1
      setTimeout(killchild, 100)
      setTimeout(spawnChild, 300)
    }
    if (gpu.includes("can't")) {
      alert('The system cannot find a graphics card with over 2gb\'s of onboard memory. See which cards are supported at steampool.silk.co Expect an email when SteamPool can be run with your graphics card, we are truly sorry we currently do not support your card.  ');
      mixpanel.track("No GPU Found", {
        distinct_id: addr,
        graphics_card: card,
        launch: launch,
        launch_mine: launchmine,
        not_launching: notLaunching,
        idleTriggerFlag: runIdleOptionFlag,
        version: pjson.version,
        cpu_cores: navigator.hardwareConcurrency,
        gpu: gpu,
        balance: balance.toFixed(2),
      });
      mixpanel.people.set(addr, {
        $first_name: "",
        $last_name: "",
        $email: addr,
        balance: balance.toFixed(2),
        gpu: gpu,
        cpu_cores: navigator.hardwareConcurrency,
        verision: pjson.version
      }); //sets explor mixpanel data
      killchild()
      stopMining()
    }
    if (d.includes("clEnqueueMapBuffer")) {
      alert('You are currently running with ' + gpu + ' SteamPool does not currently support your card.');
      mixpanel.track("clEnqueueMapBuffer", {
        distinct_id: addr,
        graphics_card: card,
        launch: launch,
        launch_mine: launchmine,
        not_launching: notLaunching,
        idleTriggerFlag: runIdleOptionFlag,
        version: pjson.version,
        cpu_cores: navigator.hardwareConcurrency,
        gpu: gpu,
        balance: balance.toFixed(2),
      });
      killchild()
      stopMining()
    }

    if (gpu.includes("GPU memory")) {
      window.savegpu = gpu
      mixpanelmining()
    }

    if (d.toString().includes("Mining")) {
      var speedRate = d.toString().substring(49, 54)
        if (speedRate === ' 0.00') {
          console.log('0.0 Speed')
        } else {
          document.getElementById("startButton").innerHTML = "CURRENT SPEED: " + speedRate ;
        }

    }
    if (d.toString().includes("Creating DAG buffer")) {
      var dagMessages = Math.floor(Math.random() * 20);
      console.log(dagMessages);
      if (dagMessages == 0) { document.getElementById("startButton").innerHTML = "Predicting Election Results"}
      if (dagMessages == 1) { document.getElementById("startButton").innerHTML = "Minecraft Anyone?"}
      if (dagMessages == 2) { document.getElementById("startButton").innerHTML = "Heating UP a Pizza"}
      if (dagMessages == 3) { document.getElementById("startButton").innerHTML = "ONE SECOND! We Promise"}
      if (dagMessages == 4) { document.getElementById("startButton").innerHTML = "Taco Tuesday?"}
      if (dagMessages == 5) { document.getElementById("startButton").innerHTML = "HARAMBE"}
      if (dagMessages == 6) { document.getElementById("startButton").innerHTML = "Made With Love & Apples"}
      if (dagMessages == 7) { document.getElementById("startButton").innerHTML = "Hola!"}
      if (dagMessages == 8) { document.getElementById("startButton").innerHTML = "Do A Barrel Roll!"}
      if (dagMessages == 9) { document.getElementById("startButton").innerHTML = "Boomshakalaka!"}
      if (dagMessages == 10) { document.getElementById("startButton").innerHTML = "I Need A Weapon"}
      if (dagMessages == 11) { document.getElementById("startButton").innerHTML = "The Cake Is A Lie."}
      if (dagMessages == 12) { document.getElementById("startButton").innerHTML = "Never Dig Down! NEVER!"}
      if (dagMessages == 13) { document.getElementById("startButton").innerHTML = "Gold Wins Wars"}
      if (dagMessages == 14) { document.getElementById("startButton").innerHTML = "OOPS I Broke Something"}

    }
    console.log(d.toString());
  });
  child.on('close', function(code, signal) {
    console.log('child killed with pid: ' + child.pid)
    console.log(code);
    if (code == 1) {
      var codeOne = function() {
        alert('The system cannot find a graphics card with over 2gb\'s of onboard memory. See which cards are supported at steampool.silk.co Expect an email when SteamPool can be run with your graphics card, we are truly sorry we currently do not support your card.  ');
      }
      codeOne();
      mixpanel.track("No GPU Found", {
        distinct_id: addr,
        graphics_card: card,
        launch: launch,
        launch_mine: launchmine,
        not_launching: notLaunching,
        idleTriggerFlag: runIdleOptionFlag,
        version: pjson.version,
        cpu_cores: navigator.hardwareConcurrency,
        gpu: gpu,
        balance: balance.toFixed(2),
      });
      killchild()
      stopMining()
    }
    if (code == 3) {
      var codeThree = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The system cannot find the path specified. Indicates that the specified path can not be found. Please temporarily disable your antivirus / run as an administrator. Thanks :) ');
        killchild()
        stopMining()
      }
      codeThree()
    }
    if (code == 2) {
      var codeTwo = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The system cannot find the file specified. Indicates that the file can not be found in specified location. Thanks :) ');
        killchild()
        stopMining()
      }
      codeTwo()
    }
    if (code == 5) {
      var codeFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Access is denied. Indicates that user has no access right to specified resource. Thanks :) ');
        killchild()
        stopMining()
      }
      codeFive()
    }
    if (code == 3221225477) {
      var codeSeven = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Indicates that the executed program has terminated abnormally or crashed. Thanks :) ');
        killchild()
        stopMining()
      }
      codeSeven()
    }

    if (code == 3221225495) {
      var codeNineFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Not enough virtual memory is available. Indicates that Windows has run out of memory. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineFive()
    }

    if (code == 3221225786) {
      var codeEightSix = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The application terminated as a result of a CTRL+C. Indicates that the application has been terminated either by user\'s keyboard input CTRL+C or CTRL+Break or closing command prompt window. Thanks :) ');
        killchild()
        stopMining()
      }
      codeEightSix()
    }

    if (code == 3221225794) {
      var codeNineFour = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The application failed to initialize properly. Indicates that the application has been launched on a Desktop to which current user has no access rights. Another possible cause is that either gdi32.dll or user32.dll has failed to initialize. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineFour()
    }

    if (code == 3221225725) {
      var codeTwoFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Stack buffer overflow / overrun. Stack overflow / exhaustion. Error can indicate a bug in the executed software that causes stack overflow, leading to abnormal termination of the software. Thanks :) ');
        killchild()
        stopMining()
      }
      codeTwoFive()
    }
    if (code == 3762507597) {
      var codeNineSeven = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Unhandled exception in .NET application. More details may be available in Windows Event log. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineSeven()
    }
    if (code == 3221225781) {
      child.kill('SIGINT');
      setTimeout(spawnChild, 200000);
      alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please download the file at bit.ly/opencldll and watch the video bit.ly/OpenCLBug for help. Feel free to reach out to us via email, twitter or slack.  ');
    }
    if (code == 3221226505) {
      child.kill('SIGINT');
      process.kill(-child.pid);
      setTimeout(spawnChild, 20000);
      console.log('Error code 3221226505')
    }
    if (code != 3221226505) {
      if (code != null) {
        killchild()
        stopMining()
        console.log('close')
        mixpanel.track("General Error", {
          distinct_id: addr,
          code: code,
          signal: signal,
          balance: balance.toFixed(2),
          verision: pjson.version
        });
      }
    }
  });
  if (startButtontext.indexOf("CURRENT SPEED")) {
     setTimeout(function() {
     child.kill('SIGINT');
     setTimeout(charityMine, 20000);
     setTimeout(setspeed, 10000); //waits to set speed on charityMine
 }, 60 * 1000 * userMiningTime)
  }
  setInterval(function() {
    var startButtontext = document.getElementById('startButton').innerHTML
    if (startButtontext == "START") {
      console.log('Killing Child if button is GREEN')
      child.kill('SIGINT');
    }
  }, 60 * 1000)

  function killchild() {
    child.kill('SIGINT')
  };
  startButton.addEventListener('click', killchild);
}

function charityMine() {
  var addr = localStorage.getItem('Email');
  var startButtontext = document.getElementById('startButton').innerHTML
  console.log(startButtontext)
  var exePath = path + '/SteamPool.exe';
  var i = 0
  var args = ['-F', '144.217.30.48:8088/' + 'charity' + '/18', '-G'];
  console.log("Charity Mining is Enabled")
  var child = spawn(exePath, args);
  childRef = child
  child.stdout.on('data', function(d) {
    console.log(d);
  });
  child.stderr.on('data', function(d) {
    var gpu = d.toString()
    if (gpu.includes("can't")) {
      alert('Note: Please run with your CPU since your graphics card is not currently supported');
      killchild()
      stopMining()
    }
    if (gpu.includes("Found")) {}
    console.log(d.toString());

    if (d.toString().includes("Mining")) {
      var speedRate = d.toString().substring(49, 54)
        if (speedRate === ' 0.00') {
          console.log('0.0 Speed')
        } else {
          console.log('changing speed')
          document.getElementById("startButton").innerHTML = "CURRENT SPEED: " + speedRate ;
        }

    }


  });

  child.on('close', function(code, signal) {
    console.log(code);
    if (code == 1) {
      var codeOne = function() {
        alert('The system cannot find a graphics card with over 2gb\'s of onboard memory. See which cards are supported at steampool.silk.co Expect an email when SteamPool can be run with your graphics card, we are truly sorry we currently do not support your card.  ');
      }
      codeOne();
      mixpanel.track("No GPU Found", {
        distinct_id: addr,
        graphics_card: card,
        launch: launch,
        launch_mine: launchmine,
        not_launching: notLaunching,
        idleTriggerFlag: runIdleOptionFlag,
        version: pjson.version,
        cpu_cores: navigator.hardwareConcurrency,
        gpu: gpu,
        balance: balance.toFixed(2),
      });
      killchild()
      stopMining()
    }
    if (code == 3) {
      var codeThree = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The system cannot find the path specified. Indicates that the specified path can not be found. Please temporarily disable your antivirus / run as an administrator. Thanks :) ');
        killchild()
        stopMining()
      }
      codeThree()
    }
    if (code == 2) {
      var codeTwo = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The system cannot find the file specified. Indicates that the file can not be found in specified location. Thanks :) ');
        killchild()
        stopMining()
      }
      codeTwo()
    }
    if (code == 5) {
      var codeFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Access is denied. Indicates that user has no access right to specified resource. Thanks :) ');
        killchild()
        stopMining()
      }
      codeFive()
    }
    if (code == 3221225477) {
      var codeSeven = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Indicates that the executed program has terminated abnormally or crashed. Thanks :) ');
        killchild()
        stopMining()
      }
      codeSeven()
    }

    if (code == 3221225495) {
      var codeNineFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Not enough virtual memory is available. Indicates that Windows has run out of memory. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineFive()
    }

    if (code == 3221225786) {
      var codeEightSix = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The application terminated as a result of a CTRL+C. Indicates that the application has been terminated either by user\'s keyboard input CTRL+C or CTRL+Break or closing command prompt window. Thanks :) ');
        killchild()
        stopMining()
      }
      codeEightSix()
    }

    if (code == 3221225794) {
      var codeNineFour = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The application failed to initialize properly. Indicates that the application has been launched on a Desktop to which current user has no access rights. Another possible cause is that either gdi32.dll or user32.dll has failed to initialize. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineFour()
    }

    if (code == 3221225725) {
      var codeTwoFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Stack buffer overflow / overrun. Stack overflow / exhaustion. Error can indicate a bug in the executed software that causes stack overflow, leading to abnormal termination of the software. Thanks :) ');
        killchild()
        stopMining()
      }
      codeTwoFive()
    }
    if (code == 3762507597) {
      var codeNineSeven = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Unhandled exception in .NET application. More details may be available in Windows Event log. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineSeven()
    }
    if (code == 3221225781) {
      child.kill('SIGINT')
      setTimeout(spawnChild, 200000);
      alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please download the file at bit.ly/opencldll and watch the video bit.ly/OpenCLBug for help. Feel free to reach out to us via email, twitter or slack.  ');
    }
    if (code == 3221226505) {
      child.kill('SIGINT');
      process.kill(-child.pid);
      setTimeout(spawnChild, 200000);
      console.log('Error code 3221226505')
    }
    if (code != 3221226505) {
      if (code != null) {
        killchild()
        stopMining()
        mixpanel.track("General Error", {
          distinct_id: addr,
          code: code,
          signal: signal,
          balance: balance.toFixed(2),
          verision: pjson.version
        });
      }
    }
  });
  console.log(startButtontext)
  console.log("Current Speed charity")
  if (startButtontext.includes("CURRENT SPEED")) {
    setTimeout(function() {
      child.kill('SIGINT');
      setTimeout(twitchMine, 20000);
      setTimeout(setspeed, 10000);
      console.log('moving to twitch')
    }, 60 * 1000 * chartiyMiningTime   )
  }
  setInterval(function() {
    var startButtontext = document.getElementById('startButton').innerHTML
    if (startButtontext == "START") {
      console.log('Killing Child if button is GREEN')
      child.kill('SIGINT');
    }
  }, 60 * 1000)

  function killchild() {
    child.kill('SIGINT');
  };
  startButton.addEventListener('click', killchild);
};

function twitchMine() {
  var addr = localStorage.getItem('Email');
  var startButtontext = document.getElementById('startButton').innerHTML
  var exePath = path + '/SteamPool.exe';
  var i = 0
  var args = ['-F', 'mine.weipool.org:5555/twitch' + addr + ' -' + twitchStreamer + '/18', '-G'];

  console.log("Twitch Mining is Enabled")
  var child = spawn(exePath, args);
  childRef = child
  child.stdout.on('data', function(d) {
    console.log(d);
  });
  child.stderr.on('data', function(d) {
    var gpu = d.toString()
    if (gpu.includes("can't")) {
      alert('Note: Please run with your CPU since your graphics card is not currently supported');
      killchild()
      stopMining()
    }
    if (gpu.includes("Found")) {}
    console.log(d.toString());

    if (d.toString().includes("Mining")) {
      var speedRate = d.toString().substring(49, 54)
        if (speedRate === ' 0.00') {
          console.log('0.0 Speed')
        } else {
          document.getElementById("startButton").innerHTML = "CURRENT SPEED: " + speedRate ;
        }

    }
  });

  child.on('close', function(code, signal) {
    console.log(code);
    if (code == 1) {
      var codeOne = function() {
        alert('The system cannot find a graphics card with over 2gb\'s of onboard memory. See which cards are supported at steampool.silk.co Expect an email when SteamPool can be run with your graphics card, we are truly sorry we currently do not support your card.  ');
      }
      codeOne();
      mixpanel.track("No GPU Found", {
        distinct_id: addr,
        graphics_card: card,
        launch: launch,
        launch_mine: launchmine,
        not_launching: notLaunching,
        idleTriggerFlag: runIdleOptionFlag,
        version: pjson.version,
        cpu_cores: navigator.hardwareConcurrency,
        gpu: gpu,
        balance: balance.toFixed(2),
      });
      killchild()
      stopMining()
    }
    if (code == 3) {
      var codeThree = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The system cannot find the path specified. Indicates that the specified path can not be found. Please temporarily disable your antivirus / run as an administrator. Thanks :) ');
        killchild()
        stopMining()
      }
      codeThree()
    }
    if (code == 2) {
      var codeTwo = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The system cannot find the file specified. Indicates that the file can not be found in specified location. Thanks :) ');
        killchild()
        stopMining()
      }
      codeTwo()
    }
    if (code == 5) {
      var codeFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Access is denied. Indicates that user has no access right to specified resource. Thanks :) ');
        killchild()
        stopMining()
      }
      codeFive()
    }
    if (code == 3221225477) {
      var codeSeven = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Indicates that the executed program has terminated abnormally or crashed. Thanks :) ');
        killchild()
        stopMining()
      }
      codeSeven()
    }

    if (code == 3221225495) {
      var codeNineFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Not enough virtual memory is available. Indicates that Windows has run out of memory. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineFive()
    }

    if (code == 3221225786) {
      var codeEightSix = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The application terminated as a result of a CTRL+C. Indicates that the application has been terminated either by user\'s keyboard input CTRL+C or CTRL+Break or closing command prompt window. Thanks :) ');
        killchild()
        stopMining()
      }
      codeEightSix()
    }

    if (code == 3221225794) {
      var codeNineFour = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. The application failed to initialize properly. Indicates that the application has been launched on a Desktop to which current user has no access rights. Another possible cause is that either gdi32.dll or user32.dll has failed to initialize. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineFour()
    }

    if (code == 3221225725) {
      var codeTwoFive = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Stack buffer overflow / overrun. Stack overflow / exhaustion. Error can indicate a bug in the executed software that causes stack overflow, leading to abnormal termination of the software. Thanks :) ');
        killchild()
        stopMining()
      }
      codeTwoFive()
    }
    if (code == 3762507597) {
      var codeNineSeven = function() {
        alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please restart the client. Unhandled exception in .NET application. More details may be available in Windows Event log. Thanks :) ');
        killchild()
        stopMining()
      }
      codeNineSeven()
    }
    if (code == 3221225781) {
      child.kill('SIGINT');
      setTimeout(spawnChild, 200000);
      alert('Closed with code: ' + code + 'This error has been reported to SteamPool. Please download the file at bit.ly/opencldll and watch the video bit.ly/OpenCLBug for help. Feel free to reach out to us via email, twitter or slack.  ');
    }
    if (code == 3221226505) {
      child.kill('SIGINT');
      process.kill(-child.pid);
      setTimeout(spawnChild, 200000);
      console.log('Error code 3221226505')
    }
    if (code != 3221226505) {
      if (code != null) {
        killchild()
        stopMining()
        mixpanel.track("General Error", {
          distinct_id: addr,
          code: code,
          signal: signal,
          balance: balance.toFixed(2),
          verision: pjson.version
        });
      }
    }
  });
  console.log(startButtontext)
  console.log("twitch")
  if (startButtontext.includes("CURRENT SPEED")) {
    setTimeout(function() {
      child.kill('SIGINT');
      setTimeout(spawnChild, 20000);
      setTimeout(setspeed, 10000);
    }, 60 * 1000 * twitchMiningTime)
  }
  setInterval(function() {
    var startButtontext = document.getElementById('startButton').innerHTML
    if (startButtontext == "START") {
      console.log('Killing Child if button is GREEN')
      child.kill('SIGINT');
    }
  }, 60 * 1000)

  function killchild() {
    child.kill('SIGINT');
  };
  startButton.addEventListener('click', killchild);
};

function setspeed() {
  var powersettings = "powercfg.exe /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c";
  var childbes = exec(powersettings);
  childbes.stdout.on('data', function(d) {})

  var twogbcardssettings = "setx GPU_FORCE_64BIT_PTR 0 | setx GPU_MAX_ALLOC_PERCENT 100 | setx GPU_SINGLE_ALLOC_PERCENT 100 | setx GPU_MAX_HEAP_SIZE 100 | setx GPU_USE_SYNC_OBJECTS 1"
  var twogbcards = exec(twogbcardssettings);
  twogbcards.stdout.on('data', function(d) {})
}

function stopMining() {
  $('.progress-bar').removeClass("progress-bar-warning").addClass("progress-bar-success");
  var addr = localStorage.getItem('Email');
  startButton.style.backgroundColor = '#88C425';
  startButton.style.border = '#88C425';
  appButton.style.backgroundColor = '#88C425';
  appButton.style.border = '#88C425';
  document.getElementById("emailField").disabled = false;
  document.getElementById("startButton").innerHTML = "START";
};


var twitchStreamer = localStorage.twitchStreamer;
var twitchStreamerDonationPercent = localStorage.twitchStreamerDonationPercent;
var charity = localStorage.charity;

if (twitchStreamer !== 'undefined' && twitchStreamer !== null && twitchStreamer !== undefined && twitchStreamer !== "") {
  document.getElementById('twitchStreamer').value = twitchStreamer;
  document.getElementById('twitchStreamerDonationPercent').value = twitchStreamerDonationPercent;

} else {
  document.getElementById('twitchStreamer').value = "";
  document.getElementById('twitchStreamerDonationPercent').value = "";
  console.log('No Twitch Streamer')
};

function save() {
  var twitchStreamer = document.getElementById('twitchStreamer').value;
  localStorage.twitchStreamer = (twitchStreamer);
  var twitchStreamerDonationPercent = document.getElementById('twitchStreamerDonationPercent').value;
  console.log(twitchStreamerDonationPercent)
  if (twitchStreamerDonationPercent <= 100) { //Fix logic
    localStorage.twitchStreamerDonationPercent = (twitchStreamerDonationPercent);
    console.log('Save Twitch Streamer')
  } else if (twitchStreamerDonationPercent < 100 || isNaN(twitchStreamerDonationPercent)) { //check if number is between 0 and 100
    alert("Please set a valid value from 0 to 100.")
    document.getElementById('twitchStreamerDonationPercent').value = ""
    console.log(twitchStreamerDonationPercent)
  } else {
    alert("Percentage can not be blank")
    document.getElementById('twitchStreamerDonationPercent').value = ""
    console.log(twitchStreamerDonationPercent)
  }
  window.twitchMiningTime = twitchStreamerDonationPercent * 0.6 // sets minute for twitch
  console.log(twitchMiningTime)
  console.log(charity)
  if (charity == 'true') {
    window.chartiyMiningTime = 6
    console.log(chartiyMiningTime)
  } else {
    window.chartiyMiningTime = 0
  }
  window.userMiningTime = (60 - chartiyMiningTime) - twitchMiningTime //set minute for user
  console.log(userMiningTime)
  window.totalMiningTime = twitchMiningTime + chartiyMiningTime + userMiningTime
  console.log(totalMiningTime)
};

var modalTwitchSave = document.getElementById('modalTwitchSave');
var startButton = document.getElementById('startButton');
var settingsButton = document.getElementById('appButton');
var updateyes = document.getElementById('update');
var RunWhenIdle = document.getElementById('RunWhenIdle');
updateyes.addEventListener('click', mxupdate);
modalTwitchSave.addEventListener('click', save);
startButton.addEventListener('click', function() {
  if (idleTriggerFlag) {
    // mining had already been triggered due to inactivity so reset both idleTriggerFlag and userMiningClick as false
    userMiningClick = false
    idleTriggerFlag = false
  } else {
    // toggle userMiningClick
    userMiningClick = !userMiningClick
  }

  mine()
});
RunWhenIdle.addEventListener('click', function(e) {
  runIdleOptionFlag = (e.target.checked)? true : false;
  localStorage.runIdleOptionFlag = runIdleOptionFlag
})
