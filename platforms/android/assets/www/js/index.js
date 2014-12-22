document.addEventListener('deviceready', devReady, false);

var reader;
var basedir;
var currpath = ""
var files = ["gberg.txt", "GNU_TR.html", "gpl-3.0.txt", "ipsum.txt"]

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
    
    
    
    for (var key in cordova.file) {
    console.log("HAI")
    var dir = cordova.file[key];
    if (dir == null){
        continue   
    }
        
     
        
    if(key == "externalRootDirectory"){
        
        $("#basedir").append("<option selected value='"+key+"'>"+dir+"</option")
    } else {
    
        $("#basedir").append("<option value='"+key+"'>"+dir+"</option")
    }
    }

    
    getDemo()
    
    basedir = cordova.file.externalRootDirectory
    window.resolveLocalFileSystemURL(basedir, gotFile, fail);
}


function success(entries) {
    $("#seconddir").html("")
    
    
    
    for (i = 0; i < entries.length; i++) {
        console.log(entries[i].name);
        if(entries[i].name == "OfflineDemoFiles"){
            $("#seconddir").append("<option selected value='"+entries[i].fullPath+"' isfile='"+entries[i].isFile+"'>/"+entries[i].name+"</option>")
        } else {
            $("#seconddir").append("<option value='"+entries[i].fullPath+"' isfile='"+entries[i].isFile+"'>/"+entries[i].name+"</option>")
        }
        
        
        /*if (entries[i].isFile) {
            $("#dirdata").append("<tr><td>" + (i + 1) + "</td><td>" + entries[i].name + "</td><td> <i class='fa fa-search' onclick=\"search('" + entries[i].fullPath + "', true)\"</i> &nbsp; </td></tr>");
        } else {
            $("#dirdata").append("<tr><td>" + (i + 1) + "</td><td>" + entries[i].name + "</td><td> <i class='fa fa-search' onclick=\"search('" + entries[i].fullPath + "', false)\"</i> &nbsp;&nbsp;&nbsp; <i class='fa fa-arrow-right' onclick=\"getNextLevel('" + entries[i].fullPath + "')\"></i></td></tr>");
        }*/
    }
}



function search() {
    var ele = $("#seconddir option:selected")
    
    var path= ele.val()
    if(ele.attr("isfile") == "true"){
        var isfile = true;   
    } else {
        var isfile = false;   
    }
    
        
    $("#term").removeClass("serror")

    var word = $("#term").val()

    if (word == "") {
        $("#term").addClass("serror")
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        return;
    }
    

    window.resolveLocalFileSystemURL(basedir + path.slice(1), function (fs) {
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
                            $("#resultsbox .resulttext").text("The word " + word + " was found " + num + " times in the file located at " + path)
                             $("#resultsbox .panel").removeClass("panel-danger").addClass("panel-success")
                        } else {
                            $("#resultsbox .resulttext").text("The word " + word + " was not found in the file located at " + path)
                            $("#resultsbox .panel").removeClass("panel-success").addClass("panel-danger")
                        }
                    } else {
                        //could not open file

                        $("#resultsbox .resulttext").text("Could not read File")
                        $("#resultsbox .panel").removeClass("panel-success").addClass("panel-danger")
                    }

                    console.log("here")
                    $("#results").prepend($("#resultsbox").html())
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
                
                if(entries.length == 0){
                       $("#resultsbox .resulttext").text("No files found in directory "+path+"!")
                       $("#resultsbox .panel").removeClass("panel-success").addClass("panel-danger")
                       $("#results").prepend($("#resultsbox").html())
                       return
                }

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
                                        $("#resultsbox .resulttext").text("The word " + word + " was not found in any of the " + entries.length + " files located at " + path)
                                        $("#resultsbox .panel").removeClass("panel-success").addClass("panel-danger")
                                    } else if (totalfiles == 1) {
                                        $("#resultsbox .resulttext").text("The word " + word + " was found one file, " + filelist[0] + ", " + totalinstances + " times. None of the other " + (entries.length - 1) + " files located at " + path + " contained it.")
                                        $("#resultsbox .panel").removeClass("panel-danger").addClass("panel-success")
                                    } else if (totalfiles > 1) {
                                        $("#resultsbox .resulttext").html("The word " + word + " was found a total of " + totalinstances + " times in " + totalfiles + " files as shown below:<br/>")
                                        $("#resultsbox .panel").removeClass("panel-danger").addClass("panel-success")
                                        
                                        
                                        for (i = 0; i < filelist.length; i++) {
                                            $("#resultsbox .resulttext").append("<b>" + filelist[i] + ":</b> " + results[i] + " instances. <br/>")
                                            $("#resultsbox .panel").removeClass("panel-failure").addClass("panel-success")
                                        }
                                    }

                                    $("#results").prepend($("#resultsbox").html())
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
    window.resolveLocalFileSystemURL(basedir + path, gotFile, fail);
}

function fail(error) {
    alert("Failed to list directory contents: " + error.code);
}




function gotFile(fileEntry) {
    console.log("FOUND FILES")

    var reader = fileEntry.createReader()
    reader.readEntries(success, fail);
}

function changeBase(ele){
    var vari = $("option:selected", ele).text()
    basedir = vari;
    
    window.resolveLocalFileSystemURL(basedir, gotFile, fail);
    
    consle.log("change")
}

function getDemo(){
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(fs){
        
    fs.getDirectory("OfflineDemoFiles", {create: true, exclusive: true})
    
    for(var i = 0; i < files.length; i++){
            $.ajax({"url":"files/"+files[i], async:false, success:function(data){
                fs.getFile("OfflineDemoFiles/"+files[i],{create: true, exclusive: true},function(file){
                    file.createWriter(function(writer){
                        writer.write(data);
                        
                    }, function(e){console.log(e)})
                }, function(e){console.log(e)})
            }})   
       }
    }
)}
