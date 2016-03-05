module.exports = {
    bundle: {
        main: {
            scripts: [
                'public/js/modules.js',
                'public/js/services/util.js',
                'public/js/components/header.js',
                'public/js/components/sections/main.js',
                'public/js/components/sections/about.js',
                'public/js/components/sections/projects.js',
                'public/js/components/sections/partners.js',
                'public/js/components/sections/team.js',
                'public/js/components/sections/contacts.js',
                'public/js/components/footer.js',
                'public/js/dar.js',
            ],
            styles: 'public/css/index.css',
            options: {
                rev: false
            }
        },
        /*vendor: {
            scripts: './bower_components/angular/angular.js'
        }*/
    }
};
