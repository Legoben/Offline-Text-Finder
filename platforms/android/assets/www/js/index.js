document.addEventListener('deviceready', devReady, false);

var reader;

var currpath = ""

function occurrences(string, subString, allowOverlapping) { //From http://stackoverflow.com/a/7924240

    string += "";
    subString += "";
    if (subString.length <= 0) return string.length + 1;

    var n = 0,
        pos = 0;
    var step = (allowOverlapping) ? (1) : (subString.length);

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            n++;
            pos += step;
        } else break;
    }
    return (n);
}

function devReady() {
    console.log("DEVICE IS READY")
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, gotFile, fail);

}


function success(entries) {
    $("#dirdata").html("")

    for (i = 0; i < entries.length; i++) {
        console.log(entries[i].name);
        if (entries[i].isFile) {
            $("#dirdata").append("<tr><td>" + (i + 1) + "</td><td>" + entries[i].name + "</td><td> <i class='fa fa-search' onclick=\"search('" + entries[i].fullPath + "', true)\"</i> &nbsp; </td></tr>");
        } else {
            $("#dirdata").append("<tr><td>" + (i + 1) + "</td><td>" + entries[i].name + "</td><td> <i class='fa fa-search' onclick=\"search('" + entries[i].fullPath + "', false)\"</i> &nbsp;&nbsp;&nbsp; <i class='fa fa-arrow-right' onclick=\"getNextLevel('" + entries[i].fullPath + "')\"></i></td></tr>");
        }
    }
}



function search(path, isfile) {
    console.log(path)
    console.log(cordova.file.externalRootDirectory + path.slice(1))
    $("#term").removeClass("serror")

    var word = $("#term").val()

    if (word == "") {
        $("#term").addClass("serror")
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        return;
    }

    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + path.slice(1), function (fs) {
        console.log(fs)




        if (isfile) {
            console.log("Is file")
            fs.file(function (file) {

                console.log(file)

                reader = new FileReader();
                reader.onloadend = function (evt) {
                    console.log("read success");
                    console.log(evt);
                    console.log(evt.target.result);

                    if (typeof evt.target.result == "string") {
                        var num = occurrences(evt.target.result.toLowerCase(), word.toLowerCase(), false)

                        console.log(num)

                        if (num != 0) {
                            $("#resulttext").text("The word " + word + " was found " + num + " times in the file located at " + path)
                        } else {
                            $("#resulttext").text("The word " + word + " was not found in the file located at " + path)
                        }
                    } else {
                        //could not open file

                        $("#resulttext").text("Could not read File")
                    }

                    console.log("here")
                    $("#resultsbox").css("display", "block")

                };

                reader.readAsText(file);

            }, fail)

        } else {
            //Otherwise, do the above for each file...
            var reader = fs.createReader()




            reader.readEntries(function (entries) {
                var totalfiles = 0;
                var totalinstances = 0;
                var filelist = []
                var results = []

                var done = 0;

                for (i = 0; i < entries.length; i++) {
                    if (entries[i].isDirectory) {
                        done += 1;
                        continue;
                    }

                    entries[i].file(function (file) {
                        reader = new FileReader();
                        reader.onloadend = function (evt) {
                            console.log("read file");
                            console.log(evt);
                            console.log(evt.target.result);

                            if (typeof evt.target.result == "string") {
                                var num = occurrences(evt.target.result.toLowerCase(), word.toLowerCase(), false)

                                console.log(num)

                                if (num != 0) {
                                    totalfiles += 1;
                                    totalinstances += num
                                    filelist.push(file.name);
                                    results.push(num)
                                }

                                done += 1;

                                if (done == entries.length) {
                                    console.log("DONE")

                                    console.log(totalfiles, totalinstances, filelist, results)

                                    if (totalinstances == 0) {
                                        $("#resulttext").text("The word " + word + " was not found in any of the " + entries.length + " files located at " + path)
                                    } else if (totalfiles == 1) {
                                        $("#resulttext").text("The word " + word + " was found one file, " + filelist[0] + ", " + totalinstances + " times. None of the other " + (entries.length - 1) + " files located at " + path + " contained it.")
                                    } else if (totalfiles > 1) {
                                        $("#resulttext").html("The word " + word + " was found a total of " + totalinstances + " times in " + totalfiles + " files as shown below:<br/>")
                                        for (i = 0; i < filelist.length; i++) {
                                            $("#resulttext").append("<b>" + filelist[i] + ":</b> " + results[i] + " instances. <br/>")
                                        }
                                    }

                                    $("#resultsbox").css("display", "block")
                                }


                            }

                        };

                        reader.readAsText(file);

                    }, fail)

                    console.log("loopt")

                }



                //Do Final Stuff

                console.log(totalfiles, totalinstances, filelist, results)


            }, fail);


        }

    }, fail);

}

function getNextLevel(path) {
    if (path != "") {
        $("#back").html("<i class='fa fa-arrow-left' onclick=\"getNextLevel('')\"></i>")
    } else {
        $("#back").html("")
    }

    console.log(path)
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + path, gotFile, fail);
}

function fail(error) {
    alert("Failed to list directory contents: " + error.code);
}



function gotFile(fileEntry) {
    console.log("FOUND FILES")

    var reader = fileEntry.createReader()
    reader.readEntries(success, fail);


}