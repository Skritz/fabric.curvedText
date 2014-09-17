/***** Required : http://fabricjs.com *****/
var CurvedText = (function() {

    /**
    * Constructor
    * @method curvedText
    * @param canvas
    * @param {object} options
    */
    function CurvedText( canvas, options ){

      // Options
      this.opts = options || {};
      for ( prop in CurvedText.defaults ) {
         if (prop in this.opts) { continue; }
         this.opts[prop] = CurvedText.defaults[prop];
      }
      this.canvas = canvas;
      this.group = new fabric.Group([], {
        selectable: this.opts.selectable,
        hasControls: this.opts.hasControls
      });
      this.canvas.add( this.group ) ;

      this._forceGroupCoords();
      this.set( 'text', this.opts.text );
    }


    /**
    * @method set
    * @param {string} param
    * @param value
    * @return false if the param name is unknown
    */
    CurvedText.prototype.set = function( param, value, render ) {

      if ( typeof param == "object" ) {
        for ( var i in param ) {
          this.set( i, param[i], false );
        }
      } else {
        if ( this.opts[param] !== undefined ) {
          this.opts[param] = value;
          if ( param === 'fontSize' || param === 'fontWeight' || param === 'fill' || param === 'fontFamily' ) {
            this._setFontStyles();
          }
          if ( param === 'selectable' ) {
            this.group.selectable = value;
          }
          if ( param === 'top' || param === 'left' ) {
            this._forceGroupCoords();
          }
          if ( param === 'text' ) {
            this.setText( value );
          }

        }
      }

      if ( render === undefined || render !== false ) {
        this._render();
      }
    };
    
    /**
    * @method get
    * @param {string} param
    * @return value of param, or false if unknown
    */
    CurvedText.prototype.get = function( param ) {
      if ( this.opts[param] !== undefined ) {
        return this.opts[param];
      } else {
        return false;
      }
    };
    
    /**
    * @method getParams
    * @return {object} value of every options
    */
    CurvedText.prototype.getParams = function() {
      return this.opts;
    };
    

    /**
    * Remove all letters from canvas
    * @method remove
    */
    CurvedText.prototype.remove = function() {
      var size = this.group.size();
      for ( var i=size; i>=0; i-- ){
        this.group.remove( this.group.item(i) );
      }
      this.canvas.remove( this.group );
      this.canvas.renderAll();
    };
    
    /**
    * Used to change the text
    * @method setText
    * @param {string} newText
    */
    CurvedText.prototype.setText = function( newText ) {

      while ( this.group.size() > newText.length ) {
        this.group.remove( this.group.item( this.group.size()-1 ) );
      }
      
      if ( newText.length > 0 ) {
        for ( var i=0; i<newText.length; i++ ){
          if ( this.group.item(i) == undefined ){
            var letter = new fabric.Text(newText[i], {
              selectable: false,
              centeredRotation: true,
              originX: 'center',
              originY: 'center'
            });
            this.group.add( letter );
          }
          else{
            this.group.item(i).text = newText[i];
          }
        }
      }
      this.opts.text = newText;
      this._setFontStyles();
      this._render();
    };
    
    /**
    * Update font size and weight
    * @private
    * @method _setFontStyles
    */
    CurvedText.prototype._setFontStyles = function() {
      if ( this.group.size() > 0 ) {
        for ( var i=0; i<this.group.size(); i++ ){
          this.group.item(i).set({
            fontSize: this.opts.fontSize,
            lineHeight: 1,
            fontWeight: this.opts.fontWeight,
            fontFamily: this.opts.fontFamily,
            fill: this.opts.fill
          });
        }
      }
    };

    /**
    * Force update group coords
    * @private
    * @method _forceGroupCoords
    */
    CurvedText.prototype._forceGroupCoords = function() {
      this.group.top = this.opts.top;
      this.group.left = this.opts.left;
    };

    
    /**
     * @method on
     */
    CurvedText.prototype.on = function( event, callback ){
      this.group.on( event, callback );
    };
    
    /**
    * calculate the position and angle of each letter
    * @private
    * @method _render
    */
    CurvedText.prototype._render = function() {
        var _self=this, curAngle=0,angleRadians=0, top, left, radiusX, radiusY, rx, ry, items = [], align;

        // Object may have been moved with drag&drop
        this.opts.top = this.group.top;
        this.opts.left = this.group.left;

        if ( this.opts.radiusX === null ) {
          radiusX = this.opts.radius;
        } else {
          radiusX = this.opts.radiusX;
        }
        if ( this.opts.radiusY === null ) {
          radiusY = this.opts.radius;
        } else {
          radiusY = this.opts.radiusY;
        }

        radiusX = parseInt(radiusX) - (this.opts.fontSize / 2);
        radiusY = parseInt(radiusY) - (this.opts.fontSize / 2);


        if ( this.group.size() > 0 ) {
          // Text align
          if ( this.opts.align == 'center' ) {
            align = (this.opts.spacing / 2) * (this.group.size() - 1) ;
          } else if ( this.opts.align == 'right' ) {
            align = (this.opts.spacing) * (this.group.size() - 1) ;
          } else {
            align = 0;
          }
          
          this.group.forEachObject(function(a, i) {
            items[i] = a;
            _self.group.removeWithUpdate(a);
          }); 

          this.canvas.remove( this.group );


          for ( var i=0; i<items.length; i++ ) {
            rx = radiusX;
            ry = radiusY;
            // Find coords of each letters (radians : angle*(Math.PI / 180)
            curAngle = (i * parseInt( this.opts.spacing )) + parseInt( this.opts.rotate ) - align;
            angleRadians = curAngle * (Math.PI / 180);
            left = Math.sin( angleRadians ) * rx;
            top = -Math.cos( angleRadians ) * ry;

            if ( radiusX != radiusY ) {
              var ratioX = rx / ( rx + ry ),
                  ratioY = ry / ( rx + ry ),
                  pct_left = Math.abs( left / rx ),
                  pct_top = Math.abs( -top / ry ),
                  ajustedAngle = ( (ratioY * 90 * pct_left) + ( ratioX * 90 * (1-pct_top)));
              if ( left < 0 ) {
                ajustedAngle = -ajustedAngle;
              }
              if ( -top < 0 ) {
                ajustedAngle = 180 - ajustedAngle;
              } 
              curAngle = ajustedAngle;
            }
          
            if ( this.opts.reverse ) {
              curAngle = -curAngle;
              top = -top;
              //console.log( 'top', top, 'angle', curAngle );
            }
            
            items[i].set({
              'top': top,
              'left': left,
              'angle': curAngle
            });

            if ( this.opts.selectable ) {
              this.group.addWithUpdate( items[i] );  
            } else {
              this.group.add( items[i] );
            }
          }
        }

        
        // Update group coords
        this.group.set({
          top: this.opts.top,
          left: this.opts.left
        });

        this.group.forEachObject(function(o){ o.set( 'active', false ); });
        this.canvas.renderAll();
        this.canvas.add(this.group);
    };



    /**
    * Default options
    */
    CurvedText.defaults = {
      top: 0,
      left: 0,
      spacing: 20,
      rotate: 0,
      radius: 50,
      radiusX: null,
      radiusY: null,
      text: 'Curved text',
      align: 'center',
      reverse: false,
      fontSize: 20,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      fill: '#000',
      selectable: true,
      hasControls: false
    };

    return CurvedText;
})();

