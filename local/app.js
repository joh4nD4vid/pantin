// Events généraux
// - - - - - - - - - - - - - - - - - - - - - - 

    document.addEventListener('click', (e)=>{

        if ( picture.hover && mode == "creation" ) { 
          new Skeleton_Point( e.offsetX, e.offsetY ); 
        }
        
    });
    
    document.addEventListener('mousedown', (e)=>{

        if ( mode == "move" ) {
            Skeleton_Point.get_hover();
        }
        
    });
    
    document.addEventListener('mouseup', (e)=>{

        if ( mode == "move" ) {
            Skeleton_Point.end_hover();
        }
        
    });

// - - - - - - - - - - - - - - - - - - - - - - 





let mode = "drop";





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

    top : undefined,
    left : undefined,

    hover : false,


    get_position: () => {

        if (picture.dom) {

            const rect = picture.dom.getBoundingClientRect();

            return {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            };

        }
        
        return null;

    },



    new : ( file ) => {

        if (file) {

            mode = "creation";

            const wrap = picture.wrap();

            const img = document.createElement('img');
            const wrap_img = document.createElement('div');
            const reader = new FileReader();

            reader.onload = (e) => {

              img.onload = () => {

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

                new Validation_button();

                let pos = picture.get_position();
                picture.top = pos.top;
                picture.left = pos.left;

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

            if ( mode == "creation" ) {
                
                picture.display_axes( true );
                picture.update_axes_pos( e );
                picture.hover = true;

            }
            
            if ( mode == "move" ) {

                if ( Skeleton_Point.is_it_a_dragged ) {
                    Skeleton_Point.is_it_a_dragged.update_pos(e);
                }

            }

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

        this.links = [];

        this.hover = false;

        Skeleton_Point.all[ this.id ] = this;
        this.init();
        this.testLink();

    }


    static id = 0;
    static HALF_POINT_SIZE = 7;

    static all = {};

    static is_it_a_dragged = false;



    static get_by_id( id ) {

        if ( Skeleton_Point.all[ id ] ) {
            return Skeleton_Point.all[ id ];
        }
        else return false;

    }


    static get_hover() {

        Object.keys( Skeleton_Point.all ).forEach( aKeyPoint => {

            const aPoint = Skeleton_Point.all[ aKeyPoint ];

            if ( aPoint.hover ) {
                aPoint.dragged( true );
            }

        });

    }


    static end_hover() {

        Object.keys( Skeleton_Point.all ).forEach( aKeyPoint => {

            const aPoint = Skeleton_Point.all[ aKeyPoint ];
            aPoint.dragged( false );

        });

    }


    static move_mode() {

        Object.keys( Skeleton_Point.all ).forEach( aKeyPoint => {

            const aPoint = Skeleton_Point.all[ aKeyPoint ];

            aPoint.ref.className = 'skeleton-point skeleton-point-hover';


            aPoint.ref.addEventListener('mouseover', (e) => {

                let point_instance = Skeleton_Point.get_by_id( e.target.id );
                point_instance.hover = true;

            });
            
            aPoint.ref.addEventListener('mouseleave', (e) => {

                let point_instance = Skeleton_Point.get_by_id( e.target.id );
                point_instance.hover = false;

            });


        });

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


    dragged( action ) {

        const CLASSIC_COLOR = "#10cefd";
        const DRAGGED_COLOR = "#f93ad2";

        let new_color = action ? DRAGGED_COLOR : CLASSIC_COLOR;
        this.ref.style.backgroundColor = new_color;

        Skeleton_Point.is_it_a_dragged = action ? this : false;
    
    }


    update_pos( e ) {
        this.x = e.clientX - picture.left;
        this.y = e.clientY - picture.top;
        this.pos();
        this.update_links();
    }


    add_a_link( link ) {
        this.links.push( link );
    }



    update_links() {

        this.links.forEach( aLink => {
            aLink.update( this );
        });

    }



}








class Link {

    constructor( a, b ) {

        Link.id++;


        this.points = [];
        this.points.push({ 'connexion' : 'left', 'SK_Point' : a });
        this.points.push({ 'connexion' : 'right', 'SK_Point' : b });


        this.id = 'link_' + Link.id;
        Link.all[ this.id ] = this;

        this.init_pos();
        this.connect_points();

    }


    static CLASSNAME = "link";
    static id = 0;
    static all = {};



    static get_by_id( id ) {

        if ( Link.all[ id ] ) {
            return Link.all[ id ];
        }
        return null;

    }


    connect_points() {

        this.points.forEach( aPoint => {
            aPoint.SK_Point.add_a_link(this);
        });

    }


    init_pos() {
        this.pos = {};
        this.pos.x = this.points[0].SK_Point.x;
        this.pos.y = this.points[0].SK_Point.y;

        this.draw();
    }


    draw() {
        let div = document.createElement('div');
        div.id = this.id;
        div.className = Link.CLASSNAME;

        
        this.calc_orientation();
        this.length = this.calc_length();

        div.style.width = this.length + 'px';
        div.style.left = this.pos.x  + 'px';
        div.style.top = this.pos.y + 'px';


        this.calc_rad();
        div.style.transform = `rotate(${this.angle}rad)`;


        picture.wrap.append( div );
        this.ref = document.querySelector('#' + this.id);
    }


    calc_orientation() {
        this.orientation = {};
        this.orientation.x = this.points[1].SK_Point.x - this.points[0].SK_Point.x;
        this.orientation.y = this.points[1].SK_Point.y - this.points[0].SK_Point.y;
    }


    calc_length() {
        return Math.sqrt( Math.pow(this.orientation.x, 2) + Math.pow(this.orientation.y, 2) );
    }


    calc_rad() {
        this.angle = Math.atan2( this.orientation.y, this.orientation.x );
    }


    update( origin ) {

        this.get_actual_active_and_passive_points( origin );

        this.ref.style.left = origin.x + 'px';
        this.ref.style.top = origin.y + 'px';
        
        this.calc_orientation();
        this.update_angle();
        this.calc_tension();

    }


    get_actual_active_and_passive_points( origin ) {

        this.points.forEach( aPoint => {

            if( aPoint.SK_Point == origin ) {
                this.actual_active_point = aPoint;
            }
            else {
                this.actual_passive_point = aPoint;
            }

        });

    }


    update_angle() {

        let rotation_center =  this.actual_active_point.connexion;
        
        let diff_angle = ( rotation_center == 'right' ) ? Math.PI : 0; 

        this.calc_rad();
        this.ref.style.transform = `rotate(${this.this.angle + diff_angle}rad)`;

    }


    calc_tension() {

        //TODO Calculer la différence entre le point "passif"
        // et le bon bout du lien.

        let connexion = this.actual_passive_point.connexion;
        let passive_point = this.actual_passive_point.SK_Point;

        let diff_x = ( connexion == 'left' ) ? 0 : this.lenght

        let new_length = this.calc_length();
        let tension = new_length - this.length;
        this.calc_norm();
        
        this.tension = {};
        this.tension.x = this.norm.x * tension;
        this.tension.y = this.norm.y * tension;

        this.apply_tension();
    }


    calc_norm() {
        this.norm = {};
        this.norm.x = this.orientation.x / this.length;
        this.norm.y = this.orientation.y / this.length;
    }


    apply_tension() {
        this.pos.x += this.tension.x;
        this.pos.y += this.tension.y;
    }


}







class Validation_button {


    constructor() {
        this.init();
    }


    init() {

        let div = document.createElement('div');
        div.id = 'validation_button';
        div.innerHTML = 'Valider';
        document.body.append( div );
        this.ref = document.querySelector('#validation_button');
        this.event();

    }


    event() {
        this.ref.addEventListener('click', (e)=>{
            this.action();
        });
    }


    action() {
        new Skeleton();
        this.end();
    }


    end() {
        this.ref.remove();
    }

}







class Skeleton {


    constructor() {
        this.init();
    }



    init() {
        mode = "move";
        picture.display_axes( false );

        Skeleton_Point.move_mode();
    }



}







let compte = 0;


function animate() {

    requestAnimationFrame( animate );
    compte++;

}

animate();