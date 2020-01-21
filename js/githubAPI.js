var repoList = [ 
    {'owner':'TechShady','repo':'Dynatrace-DashboardsV4'},
    {'owner':'TechShady','repo':'Dynatrace-DashboardV5'}
    ];

function getRepoContents(repo) {
    //Get App list from API as JSON
    return $.ajax({
    url: "https://api.github.com/repos/"+repo.owner+"/"+repo.repo+"/contents",
    contentType: "application/json; charset=utf-8",
    method: 'GET',
    dataType: "json"
    })
    .fail(errorboxJQXHR);
    
}

function parseRepoContents(data) {
    let contents = [];
    data.forEach(function(file) {
        let re = /\.json$/;
        if(re.test(file.path))
            contents.push(file);
    });
    return contents;
}

function getDBJSON(list) {
    let dbs = [];
    let promises = [];

    list.forEach(function(file) {
        let p = $.get(file.download_url)
            .fail(errorboxJQXHR);
        promises.push(p);
    });

    return $.when.apply($, promises).then(function() {
        for(let i=0; i<arguments.length; i++) {
            dbs.push(JSON.parse(arguments[i][0]));;
        };
        return dbs;
    });
}

function testRepo(i=0) {
    let p1 = getRepoContents(repoList[i]);

    $.when(p1).done(function(data) {
        let repos = parseRepoContents(data);

        let p2 = getDBJSON(repos);
        $.when(p2).done(function(d2) {
            console.log(d2);
        });
    });
}
