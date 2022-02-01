{
  'conditions': [
    ['OS=="win"', {
      'variables': {
        'GTK_Root%': 'C:/GTK',  # Set the location of GTK all-in-one bundle
        'with_jpeg%': 'false',
        'with_gif%': 'false',
        'with_rsvg%': 'false',
        'variables': { # Nest jpeg_root to evaluate it before with_jpeg
          'jpeg_root%': '<!(node ./util/win_jpeg_lookup)'
        },
        'jpeg_root%': '<(jpeg_root)', # Take value of nested variable
        'conditions': [
          ['jpeg_root==""', {
            'with_jpeg%': 'false'
          }, {
            'with_jpeg%': 'true'
          }]
        ]
      }
    }, {  # 'OS!="win"'
      'variables': {
        'with_jpeg%': '<!(node ./util/has_lib.js jpeg)',
        'with_gif%': '<!(node ./util/has_lib.js gif)',
        'with_rsvg%': '<!(node ./util/has_lib.js rsvg)'
      }
    }]
  ],
  'targets': [
    {
      'target_name': 'canvas-postbuild',
      'dependencies': ['canvas'],
      'conditions': [
        ['OS=="win"', {
          'copies': [{
            'destination': '<(PRODUCT_DIR)',
            'files': [
              '<(GTK_Root)/bin/zlib1.dll',
              '<(GTK_Root)/bin/libintl-8.dll',
              '<(GTK_Root)/bin/libpng14-14.dll',
              '<(GTK_Root)/bin/libpangocairo-1.0-0.dll',
              '<(GTK_Root)/bin/libpango-1.0-0.dll',
              '<(GTK_Root)/bin/libpangoft2-1.0-0.dll',
              '<(GTK_Root)/bin/libpangowin32-1.0-0.dll',
              '<(GTK_Root)/bin/libcairo-2.dll',
              '<(GTK_Root)/bin/libfontconfig-1.dll',
              '<(GTK_Root)/bin/libfreetype-6.dll',
              '<(GTK_Root)/bin/libglib-2.0-0.dll',
              '<(GTK_Root)/bin/libgobject-2.0-0.dll',
              '<(GTK_Root)/bin/libgmodule-2.0-0.dll',
              '<(GTK_Root)/bin/libgthread-2.0-0.dll',
              '<(GTK_Root)/bin/libexpat-1.dll'
            ]
          }]
        }]
      ]
    },
    {
      'target_name': 'canvas',
      'include_dirs': ["<!(node -e \"require('nan')\")"],
      'sources': [
        'src/backend/Backend.cc',
        'src/backend/ImageBackend.cc',
        'src/backend/PdfBackend.cc',
        'src/backend/SvgBackend.cc',
        'src/bmp/BMPParser.cc',
        'src/Backends.cc',
        'src/Canvas.cc',
        'src/CanvasGradient.cc',
        'src/CanvasPattern.cc',
        'src/CanvasRenderingContext2d.cc',
        'src/closure.cc',
        'src/color.cc',
        'src/Image.cc',
        'src/ImageData.cc',
        'src/init.cc',
        'src/register_font.cc'
      ],
      'conditions': [
        ['OS=="win"', {
          'libraries': [
            '-l<(GTK_Root)/lib/cairo.lib',
            '-l<(GTK_Root)/lib/libpng.lib',
            '-l<(GTK_Root)/lib/pangocairo-1.0.lib',
            '-l<(GTK_Root)/lib/pango-1.0.lib',
            '-l<(GTK_Root)/lib/freetype.lib',
            '-l<(GTK_Root)/lib/glib-2.0.lib',
            '-l<(GTK_Root)/lib/gobject-2.0.lib'
          ],
          'include_dirs': [
            '<(GTK_Root)/include',
            '<(GTK_Root)/include/cairo',
            '<(GTK_Root)/include/pango-1.0',
            '<(GTK_Root)/include/glib-2.0',
            '<(GTK_Root)/include/freetype2',
            '<(GTK_Root)/lib/glib-2.0/include'
          ],
          'defines': [
            '_USE_MATH_DEFINES'  # for M_PI
          ],
          'configurations': {
            'Debug': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'WarningLevel': 4,
                  'ExceptionHandling': 1,
                  'DisableSpecificWarnings': [
                    4100, 4611
                  ]
                }
              }
            },
            'Release': {
              'msvs_settings': {
                'VCCLCompilerTool': {
                  'WarningLevel': 4,
                  'ExceptionHandling': 1,
                  'DisableSpecificWarnings': [
                    4100, 4611
                  ]
                }
              }
            }
          }
        }, {  # 'OS!="win"'
          'libraries': [
            '<!@(pkg-config pixman-1 --libs)',
            '<!@(pkg-config cairo --libs)',
            '<!@(pkg-config libpng --libs)',
            '<!@(pkg-config pangocairo --libs)',
            '<!@(pkg-config freetype2 --libs)'
          ],
          'include_dirs': [
            '<!@(pkg-config cairo --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config libpng --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config pangocairo --cflags-only-I | sed s/-I//g)',
            '<!@(pkg-config freetype2 --cflags-only-I | sed s/-I//g)'
          ],
          'cflags': ['-Wno-cast-function-type'],
          'cflags!': ['-fno-exceptions'],
          'cflags_cc!': ['-fno-exceptions']
        }],
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }],
        ['with_jpeg=="true"', {
          'defines': [
            'HAVE_JPEG'
          ],
          'conditions': [
            ['OS=="win"', {
              'copies': [{
                'destination': '<(PRODUCT_DIR)',
                'files': [
                  '<(jpeg_root)/bin/jpeg62.dll',
                ]
              }],
              'include_dirs': [
                '<(jpeg_root)/include'
              ],
              'libraries': [
                '-l<(jpeg_root)/lib/jpeg.lib',
              ]
            }, {
              'include_dirs': [
                '<!@(pkg-config libjpeg --cflags-only-I | sed s/-I//g)'
              ],
              'libraries': [
                '<!@(pkg-config libjpeg --libs)'
              ]
            }]
          ]
        }],
        ['with_gif=="true"', {
          'defines': [
            'HAVE_GIF'
          ],
          'conditions': [
            ['OS=="win"', {
              'libraries': [
                '-l<(GTK_Root)/lib/gif.lib'
              ]
            }, {
              'include_dirs': [
                '/opt/homebrew/include'
              ],
              'libraries': [
                '-L/opt/homebrew/lib',
                '-lgif'
              ]
            }]
          ]
        }],
        ['with_rsvg=="true"', {
          'defines': [
            'HAVE_RSVG'
          ],
          'conditions': [
            ['OS=="win"', {
              'copies': [{
                'destination': '<(PRODUCT_DIR)',
                'files': [
                  '<(GTK_Root)/bin/librsvg-2-2.dll',
                  '<(GTK_Root)/bin/libgdk_pixbuf-2.0-0.dll',
                  '<(GTK_Root)/bin/libgio-2.0-0.dll',
                  '<(GTK_Root)/bin/libcroco-0.6-3.dll',
                  '<(GTK_Root)/bin/libgsf-1-114.dll',
                  '<(GTK_Root)/bin/libxml2-2.dll'
                ]
              }],
              'libraries': [
                '-l<(GTK_Root)/lib/librsvg-2-2.lib'
              ]
            }, {
              'include_dirs': [
                '<!@(pkg-config librsvg-2.0 --cflags-only-I | sed s/-I//g)'
              ],
              'libraries': [
                '<!@(pkg-config librsvg-2.0 --libs)'
              ]
            }]
          ]
        }]
      ]
    }
  ]
}
