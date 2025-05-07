// Events généraux
// - - - - - - - - - - - - - - - - - - - - - - 

    document.addEventListener('click', (e)=>{

        if ( picture.hover ) { 
          new Skeleton_Point( e.offsetX, e.offsetY ); 
        }

    });

// - - - - - - - - - - - - - - - - - - - - - - 








const drop = {


    zone : document.getElementById('dropZone'),


    events : () => {


        drop.zone.addEventListener('dragover', (event) => {

          event.preventDefault();
          dropZone.style.borderColor = '#000';

        });


        drop.zone.addEventListener('dragleave', () => {
          dropZone.style.borderColor = '#ccc';
        });


        drop.zone.addEventListener('drop', (event) => {

          event.preventDefault();
          dropZone.style.borderColor = '#ccc';

          const files = event.dataTransfer.files;

          if (files.length > 0) {

            drop.end();
            picture.new( files[0] );

          }

      });


    },


    end : () => { drop.zone.remove(); }


};


drop.events();








const picture = {



    dom : undefined,
    wrap : undefined,
    axeX : document.querySelector('#axeX'),
    axeY : document.querySelector('#axeY'),

    hover : false,



    new : ( file ) => {

        if (file) {

            const wrap = picture.wrap();

            const img = document.createElement('img');
            const wrap_img = document.createElement('div');
            const reader = new FileReader();

            reader.onload = (e) => {

              img.onload = () => {

                console.log( img.naturalWidth );
                wrap_img.style.width = img.naturalWidth + 'px';
                wrap_img.style.height = img.naturalHeight + 'px';
                wrap_img.id =  "wrap_img";


                img.width = img.naturalWidth;
                img.height = img.naturalHeight;
                img.id = "picture";
                wrap_img.appendChild(img);
                wrap.append( wrap_img );


                picture.dom = document.getElementById('picture');
                picture.wrap = document.getElementById('wrap_img');
                picture.events();

              };

              img.src = e.target.result;

            };

            reader.readAsDataURL(file);

        }

    },

    

    wrap : () => {

        let wrap = document.createElement('div');
        wrap.id = "wrap-picture";
        document.body.append( wrap );

        return document.getElementById('wrap-picture');

    },



    events : () => {


        picture.wrap.addEventListener('mousemove', (e)=>{

            picture.display_axes( true );
            picture.update_axes_pos( e );
            picture.hover = true;

        });


        picture.wrap.addEventListener('mouseleave', (e)=>{

           picture.display_axes( false );
           picture.hover = false;

        });

    },



    display_axes : ( action ) => {

        let className = action ? '' : 'invisible';
        picture.axeX.className = className;
        picture.axeY.className = className;

    },



    update_axes_pos : (e) => {

        picture.axeX.style.left = e.clientX + 'px'; 
        picture.axeY.style.top = e.clientY + 'px'; 

    }



};







class Skeleton_Point {


    constructor( x, y ) {

        this.prec_id = 'SK_' + Skeleton_Point.id;

        Skeleton_Point.id++;

        this.id = 'SK_' + Skeleton_Point.id;
        this.x = x;
        this.y = y;

        Skeleton_Point.all[ this.id ] = this;
        this.init();
        this.testLink();

    }


    static id = 0;
    static HALF_POINT_SIZE = 7;

    static all = {};


    static get_by_id( id ) {

        if ( Skeleton_Point.all[ id ] ) {
            return Skeleton_Point.all[ id ];
        }
        return false;

    }



    init() {
        this.div = document.createElement('div');
        this.div.className = 'skeleton-point';
        this.div.id = this.id;
        
        this.pos();
        this.insert();
    }


    pos() {
        this.div.style.top = ( this.y - Skeleton_Point.HALF_POINT_SIZE ) + 'px';
        this.div.style.left = ( this.x - Skeleton_Point.HALF_POINT_SIZE ) + 'px';
    }


    insert() {
        picture.wrap.append( this.div );
        this.ref = document.querySelector('#' + this.id );
    }


    testLink() {

        const a = Skeleton_Point.get_by_id( this.prec_id );

        if ( a ) {
            new Link( a, this );
        };

    }



}








class Link {

    constructor( a, b ) {
        Link.id++;

        this.a = a;
        this.b = b;
        this.id = 'link_' + Link.id;
        Link.all[ this.id ] = this;
    }


    static CLASSNAME = "link";
    static id = 0;
    static all = {};


    draw() {
        let div = document.createElement('div');
        div.id = this.id;
        div.className = Link.CLASSNAME;
        
    }


}







