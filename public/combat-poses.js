// BRICK BATTLEGROUNDS — v0.8.3 animation pass
// CHANGED: Editorially authored guard, windup, impact, overshoot, recoil, recovery.
// Rotation values are degrees; conversion into radians happens only in applyCombatPose().
// Contact frames retain all existing combat timing (.2304, .3795, .24, .375, .9).
export const COMBAT_POSES={
  "light": [
    {
      "name": "LEFT JAB",
      "len": 0.48,
      "blend": 0.075,
      "frames": [
        {
          "t": 0,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        },
        {
          "t": 0.105,
          "e": "sine",
          "j": {
            "LS": [
              23,
              -11,
              15
            ],
            "LE": [
              119,
              0,
              0
            ],
            "RS": [
              68,
              5,
              -17
            ],
            "RE": [
              104,
              0,
              0
            ],
            "T": [
              -6,
              15,
              -6
            ],
            "LH": [
              -11,
              0,
              -4
            ],
            "RH": [
              10,
              0,
              0
            ]
          }
        },
        {
          "t": 0.205,
          "e": "outCubic",
          "j": {
            "LS": [
              95,
              -8,
              11
            ],
            "LE": [
              14,
              0,
              0
            ],
            "RS": [
              70,
              5,
              -17
            ],
            "RE": [
              108,
              0,
              0
            ],
            "T": [
              7,
              -19,
              6
            ],
            "LH": [
              -17,
              0,
              -6
            ],
            "RH": [
              10,
              0,
              0
            ],
            "RK": [
              -8,
              0,
              0
            ]
          }
        },
        {
          "t": 0.2304,
          "e": "outCubic",
          "j": {
            "LS": [
              108,
              -9,
              11
            ],
            "LE": [
              2,
              0,
              0
            ],
            "RS": [
              71,
              5,
              -17
            ],
            "RE": [
              108,
              0,
              0
            ],
            "T": [
              12,
              -23,
              8
            ],
            "LH": [
              -17,
              0,
              -7
            ],
            "RH": [
              10,
              0,
              0
            ]
          }
        },
        {
          "t": 0.28,
          "e": "outCubic",
          "j": {
            "LS": [
              93,
              -9,
              10
            ],
            "LE": [
              15,
              0,
              0
            ],
            "RS": [
              70,
              5,
              -17
            ],
            "RE": [
              107,
              0,
              0
            ],
            "T": [
              8,
              -15,
              4
            ]
          }
        },
        {
          "t": 0.38,
          "e": "sine",
          "j": {
            "LS": [
              56,
              -5,
              15
            ],
            "LE": [
              98,
              0,
              0
            ],
            "RS": [
              67,
              4,
              -16
            ],
            "RE": [
              103,
              0,
              0
            ],
            "T": [
              -1,
              -8,
              -2
            ]
          }
        },
        {
          "t": 0.48,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        }
      ]
    },
    {
      "name": "RIGHT CROSS",
      "len": 0.48,
      "blend": 0.075,
      "frames": [
        {
          "t": 0,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        },
        {
          "t": 0.11,
          "e": "sine",
          "j": {
            "RS": [
              18,
              12,
              -13
            ],
            "RE": [
              121,
              0,
              0
            ],
            "LS": [
              68,
              -5,
              17
            ],
            "LE": [
              110,
              0,
              0
            ],
            "T": [
              -6,
              -24,
              7
            ],
            "RH": [
              -10,
              0,
              5
            ],
            "LH": [
              10,
              0,
              0
            ]
          }
        },
        {
          "t": 0.207,
          "e": "outCubic",
          "j": {
            "RS": [
              97,
              9,
              -9
            ],
            "RE": [
              13,
              0,
              0
            ],
            "LS": [
              70,
              -5,
              16
            ],
            "LE": [
              110,
              0,
              0
            ],
            "T": [
              9,
              23,
              -7
            ],
            "RH": [
              -19,
              0,
              7
            ],
            "LH": [
              12,
              0,
              0
            ],
            "LK": [
              -9,
              0,
              0
            ]
          }
        },
        {
          "t": 0.2304,
          "e": "outCubic",
          "j": {
            "RS": [
              111,
              8,
              -8
            ],
            "RE": [
              2,
              0,
              0
            ],
            "LS": [
              71,
              -6,
              17
            ],
            "LE": [
              112,
              0,
              0
            ],
            "T": [
              13,
              27,
              -9
            ],
            "RH": [
              -20,
              0,
              7
            ],
            "LH": [
              13,
              0,
              0
            ]
          }
        },
        {
          "t": 0.285,
          "e": "outCubic",
          "j": {
            "RS": [
              93,
              8,
              -10
            ],
            "RE": [
              18,
              0,
              0
            ],
            "LS": [
              68,
              -5,
              16
            ],
            "LE": [
              110,
              0,
              0
            ],
            "T": [
              8,
              16,
              -5
            ]
          }
        },
        {
          "t": 0.39,
          "e": "sine",
          "j": {
            "RS": [
              61,
              4,
              -14
            ],
            "RE": [
              94,
              0,
              0
            ],
            "LS": [
              61,
              -5,
              16
            ],
            "LE": [
              106,
              0,
              0
            ],
            "T": [
              -1,
              -2,
              -2
            ]
          }
        },
        {
          "t": 0.48,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        }
      ]
    },
    {
      "name": "RIGHT KICK",
      "len": 0.69,
      "blend": 0.075,
      "frames": [
        {
          "t": 0,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        },
        {
          "t": 0.145,
          "e": "sine",
          "j": {
            "RH": [
              92,
              -4,
              10
            ],
            "RK": [
              -103,
              0,
              0
            ],
            "LH": [
              8,
              0,
              -10
            ],
            "LK": [
              -15,
              0,
              0
            ],
            "LS": [
              69,
              -6,
              20
            ],
            "LE": [
              109,
              0,
              0
            ],
            "RS": [
              71,
              6,
              -18
            ],
            "RE": [
              108,
              0,
              0
            ],
            "T": [
              -14,
              5,
              -9
            ]
          }
        },
        {
          "t": 0.335,
          "e": "outCubic",
          "j": {
            "RH": [
              96,
              -2,
              10
            ],
            "RK": [
              -14,
              0,
              0
            ],
            "LH": [
              12,
              0,
              -12
            ],
            "LK": [
              -19,
              0,
              0
            ],
            "LS": [
              69,
              -7,
              20
            ],
            "LE": [
              109,
              0,
              0
            ],
            "RS": [
              73,
              6,
              -18
            ],
            "RE": [
              109,
              0,
              0
            ],
            "T": [
              -17,
              10,
              -12
            ]
          }
        },
        {
          "t": 0.3795,
          "e": "outCubic",
          "j": {
            "RH": [
              110,
              -2,
              11
            ],
            "RK": [
              -2,
              0,
              0
            ],
            "LH": [
              12,
              0,
              -12
            ],
            "LK": [
              -20,
              0,
              0
            ],
            "LS": [
              70,
              -7,
              19
            ],
            "LE": [
              110,
              0,
              0
            ],
            "RS": [
              74,
              6,
              -18
            ],
            "RE": [
              110,
              0,
              0
            ],
            "T": [
              -18,
              12,
              -12
            ]
          }
        },
        {
          "t": 0.46,
          "e": "sine",
          "j": {
            "RH": [
              91,
              -2,
              9
            ],
            "RK": [
              -94,
              0,
              0
            ],
            "LH": [
              11,
              0,
              -11
            ],
            "LK": [
              -16,
              0,
              0
            ],
            "LS": [
              67,
              -7,
              19
            ],
            "RS": [
              69,
              6,
              -18
            ],
            "T": [
              -14,
              8,
              -10
            ]
          }
        },
        {
          "t": 0.56,
          "e": "sine",
          "j": {
            "RH": [
              43,
              -2,
              5
            ],
            "RK": [
              -65,
              0,
              0
            ],
            "LH": [
              3,
              0,
              -6
            ],
            "T": [
              -6,
              1,
              -4
            ],
            "LK": [
              -8,
              0,
              0
            ]
          }
        },
        {
          "t": 0.69,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        }
      ]
    },
    {
      "name": "LEFT HOOK",
      "len": 0.5,
      "blend": 0.075,
      "frames": [
        {
          "t": 0,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        },
        {
          "t": 0.115,
          "e": "sine",
          "j": {
            "LS": [
              22,
              -26,
              -25
            ],
            "LE": [
              113,
              0,
              0
            ],
            "RS": [
              70,
              5,
              -17
            ],
            "RE": [
              108,
              0,
              0
            ],
            "T": [
              -8,
              28,
              -10
            ],
            "LH": [
              -10,
              0,
              -5
            ]
          }
        },
        {
          "t": 0.215,
          "e": "outCubic",
          "j": {
            "LS": [
              92,
              -49,
              -24
            ],
            "LE": [
              70,
              0,
              0
            ],
            "RS": [
              70,
              5,
              -17
            ],
            "RE": [
              111,
              0,
              0
            ],
            "T": [
              11,
              -20,
              11
            ],
            "LH": [
              -15,
              0,
              -7
            ],
            "RH": [
              12,
              0,
              0
            ]
          }
        },
        {
          "t": 0.24,
          "e": "outCubic",
          "j": {
            "LS": [
              107,
              -56,
              -20
            ],
            "LE": [
              59,
              0,
              0
            ],
            "RS": [
              73,
              5,
              -17
            ],
            "RE": [
              110,
              0,
              0
            ],
            "T": [
              14,
              -31,
              15
            ],
            "LH": [
              -19,
              0,
              -9
            ],
            "RH": [
              12,
              0,
              0
            ]
          }
        },
        {
          "t": 0.3,
          "e": "sine",
          "j": {
            "LS": [
              94,
              -40,
              -23
            ],
            "LE": [
              71,
              0,
              0
            ],
            "RS": [
              73,
              5,
              -17
            ],
            "RE": [
              110,
              0,
              0
            ],
            "T": [
              11,
              -20,
              9
            ]
          }
        },
        {
          "t": 0.41,
          "e": "sine",
          "j": {
            "LS": [
              59,
              -8,
              11
            ],
            "LE": [
              101,
              0,
              0
            ],
            "RS": [
              67,
              4,
              -16
            ],
            "RE": [
              104,
              0,
              0
            ],
            "T": [
              0,
              -7,
              -2
            ]
          }
        },
        {
          "t": 0.5,
          "e": "sine",
          "j": {
            "LS": [
              57,
              -4,
              16
            ],
            "LE": [
              104,
              0,
              0
            ],
            "RS": [
              66,
              4,
              -16
            ],
            "RE": [
              101,
              0,
              0
            ],
            "LH": [
              -7,
              0,
              0
            ],
            "RH": [
              8,
              0,
              0
            ],
            "LK": [
              6,
              0,
              0
            ],
            "RK": [
              -6,
              0,
              0
            ],
            "T": [
              -3,
              -7,
              -2
            ],
            "H": [
              0,
              0,
              0
            ]
          }
        }
      ]
    }
  ],
  "heavy": {
    "name": "HOOK + ROUNDHOUSE",
    "len": 1.25,
    "blend": 0.075,
    "frames": [
      {
        "t": 0,
        "e": "sine",
        "j": {
          "LS": [
            57,
            -4,
            16
          ],
          "LE": [
            104,
            0,
            0
          ],
          "RS": [
            66,
            4,
            -16
          ],
          "RE": [
            101,
            0,
            0
          ],
          "LH": [
            -7,
            0,
            0
          ],
          "RH": [
            8,
            0,
            0
          ],
          "LK": [
            6,
            0,
            0
          ],
          "RK": [
            -6,
            0,
            0
          ],
          "T": [
            -3,
            -7,
            -2
          ],
          "H": [
            0,
            0,
            0
          ]
        }
      },
      {
        "t": 0.245,
        "e": "sine",
        "j": {
          "LS": [
            9,
            -33,
            -27
          ],
          "LE": [
            123,
            0,
            0
          ],
          "RS": [
            70,
            8,
            -19
          ],
          "RE": [
            109,
            0,
            0
          ],
          "T": [
            -10,
            34,
            -14
          ],
          "LH": [
            -15,
            0,
            -7
          ],
          "RH": [
            11,
            0,
            0
          ]
        }
      },
      {
        "t": 0.345,
        "e": "outCubic",
        "j": {
          "LS": [
            108,
            -52,
            -21
          ],
          "LE": [
            58,
            0,
            0
          ],
          "RS": [
            75,
            7,
            -18
          ],
          "RE": [
            109,
            0,
            0
          ],
          "T": [
            17,
            -29,
            16
          ],
          "LH": [
            -20,
            0,
            -8
          ],
          "RH": [
            14,
            0,
            0
          ]
        }
      },
      {
        "t": 0.375,
        "e": "outCubic",
        "j": {
          "LS": [
            118,
            -58,
            -20
          ],
          "LE": [
            49,
            0,
            0
          ],
          "RS": [
            76,
            7,
            -18
          ],
          "RE": [
            109,
            0,
            0
          ],
          "T": [
            21,
            -36,
            18
          ],
          "LH": [
            -20,
            0,
            -9
          ],
          "RH": [
            14,
            0,
            0
          ]
        }
      },
      {
        "t": 0.47,
        "e": "outCubic",
        "j": {
          "LS": [
            96,
            -39,
            -21
          ],
          "LE": [
            77,
            0,
            0
          ],
          "RS": [
            73,
            7,
            -18
          ],
          "RE": [
            107,
            0,
            0
          ],
          "T": [
            13,
            -19,
            11
          ]
        }
      },
      {
        "t": 0.675,
        "e": "outCubic",
        "j": {
          "RH": [
            94,
            16,
            15
          ],
          "RK": [
            -105,
            0,
            0
          ],
          "LH": [
            11,
            0,
            -13
          ],
          "LK": [
            -18,
            0,
            0
          ],
          "LS": [
            74,
            -8,
            19
          ],
          "LE": [
            108,
            0,
            0
          ],
          "RS": [
            75,
            7,
            -18
          ],
          "RE": [
            109,
            0,
            0
          ],
          "T": [
            -18,
            29,
            -15
          ]
        }
      },
      {
        "t": 0.858,
        "e": "outCubic",
        "j": {
          "RH": [
            104,
            20,
            17
          ],
          "RK": [
            -14,
            0,
            0
          ],
          "LH": [
            13,
            0,
            -17
          ],
          "LK": [
            -21,
            0,
            0
          ],
          "LS": [
            75,
            -7,
            20
          ],
          "LE": [
            111,
            0,
            0
          ],
          "RS": [
            78,
            8,
            -18
          ],
          "RE": [
            111,
            0,
            0
          ],
          "T": [
            -21,
            33,
            -17
          ]
        }
      },
      {
        "t": 0.9,
        "e": "outCubic",
        "j": {
          "RH": [
            116,
            20,
            18
          ],
          "RK": [
            -2,
            0,
            0
          ],
          "LH": [
            14,
            0,
            -17
          ],
          "LK": [
            -20,
            0,
            0
          ],
          "LS": [
            77,
            -7,
            20
          ],
          "LE": [
            112,
            0,
            0
          ],
          "RS": [
            79,
            8,
            -19
          ],
          "RE": [
            111,
            0,
            0
          ],
          "T": [
            -21,
            36,
            -18
          ]
        }
      },
      {
        "t": 1,
        "e": "sine",
        "j": {
          "RH": [
            95,
            13,
            13
          ],
          "RK": [
            -98,
            0,
            0
          ],
          "LH": [
            11,
            0,
            -15
          ],
          "LK": [
            -17,
            0,
            0
          ],
          "T": [
            -17,
            26,
            -14
          ],
          "LS": [
            75,
            0,
            -9
          ],
          "RS": [
            73,
            0,
            9
          ]
        }
      },
      {
        "t": 1.14,
        "e": "sine",
        "j": {
          "RH": [
            42,
            4,
            5
          ],
          "RK": [
            -63,
            0,
            0
          ],
          "LH": [
            3,
            0,
            -7
          ],
          "T": [
            -6,
            4,
            -5
          ],
          "LK": [
            -9,
            0,
            0
          ]
        }
      },
      {
        "t": 1.25,
        "e": "sine",
        "j": {
          "LS": [
            57,
            -4,
            16
          ],
          "LE": [
            104,
            0,
            0
          ],
          "RS": [
            66,
            4,
            -16
          ],
          "RE": [
            101,
            0,
            0
          ],
          "LH": [
            -7,
            0,
            0
          ],
          "RH": [
            8,
            0,
            0
          ],
          "LK": [
            6,
            0,
            0
          ],
          "RK": [
            -6,
            0,
            0
          ],
          "T": [
            -3,
            -7,
            -2
          ],
          "H": [
            0,
            0,
            0
          ]
        }
      }
    ]
  }
};

// CHANGED: A living martial-arts guard with readable fists-up silhouettes.
// The existing physics, movement speeds and collision code are untouched.
const GUARD={LS:[57,-4,16],LE:[104,0,0],RS:[66,4,-16],RE:[101,0,0],
 LH:[-7,0,0],RH:[8,0,0],LK:[6,0,0],RK:[-6,0,0],T:[-3,-7,-2],H:[0,0,0]};
const NAMES=['LS','RS','LE','RE','LH','RH','LK','RK','T','H'],DEG=Math.PI/180,OUT=.10;
const saved=new WeakMap(),states=new WeakMap(),clamp=t=>Math.max(0,Math.min(1,t));
const EASE={sine:t=>(1-Math.cos(Math.PI*clamp(t)))/2,outCubic:t=>1-(1-clamp(t))**3};
function withGuard(p={}){return {...GUARD,...p};}
function interpolate(a,b,t){
 const out={},k=clamp(t);
 for(const n of NAMES){
  const u=a[n]||GUARD[n],v=b[n]||GUARD[n];
  out[n]=[u[0]+(v[0]-u[0])*k,u[1]+(v[1]-u[1])*k,u[2]+(v[2]-u[2])*k];
 }
 return out;
}
export function fightingStance(f){
 const walk=Math.min(1,f.moving||0)*(f.stun>0?.2:1);
 const stride=Math.sin(f.runTime||0),phase=Math.cos(f.runTime||0);
 const breath=Math.sin((f.combatClock||0)*3.4);
 if(f.block)return withGuard({LS:[76,-5,11],LE:[125,0,0],RS:[76,5,-11],RE:[125,0,0],LH:[-8,0,0],RH:[7,0,0],LK:[12,0,0],RK:[10,0,0],T:[10,-3,0]});
 return withGuard({
  LS:[57+walk*stride*7+breath*1.2,-4,16+walk*phase*3],LE:[104-walk*stride*6,0,0],
  RS:[66-walk*stride*7-breath,4,-16-walk*phase*3],RE:[101+walk*stride*6,0,0],
  LH:[-7+walk*stride*21,0,0],RH:[8-walk*stride*21,0,0],
  LK:[6+walk*Math.max(0,-stride)*15,0,0],RK:[-6+walk*Math.max(0,stride)*15,0,0],
  T:[-3+walk*phase*2,-7+walk*stride*5,-2+walk*stride*2]});
}
function getJoints(f){
 const {arms,legs,body,head}=f.visual.userData;
 return {LS:arms[0],RS:arms[1],LE:arms[0]?.userData.elbow,RE:arms[1]?.userData.elbow,LH:legs[0],RH:legs[1],LK:legs[0]?.userData.knee,RK:legs[1]?.userData.knee,T:body,H:head};
}
export function captureCombatRest(f){
 const nodes=getJoints(f),rest={};
 for(const n of NAMES){if(!nodes[n])throw Error('Missing joint '+n);const r=nodes[n].rotation;rest[n]=[r.x,r.y,r.z]}
 saved.set(f.visual,{nodes,rest});states.delete(f);
}
function atTime(frames,time){
 if(time<=0)return withGuard(frames[0].j);
 for(let i=1;i<frames.length;i++){
  const a=frames[i-1],b=frames[i];
  if(time<=b.t)return interpolate(withGuard(a.j),withGuard(b.j),EASE[b.e||'sine']((time-a.t)/(b.t-a.t)));
 }
 return withGuard(frames.at(-1).j);
}
export function sampleCombatPose(f,dt){
 const attack=f.attack;
 if(attack?.kind==='special'){states.delete(f);return null;}
 const data=attack?.kind==='light'?COMBAT_POSES.light[attack.stage-1]:attack?.kind==='heavy'?COMBAT_POSES.heavy:null;
 const guard=fightingStance(f);
 let st=states.get(f);
 if(!st){st={attack:null,pose:guard,from:guard,releaseFrom:guard,release:OUT};states.set(f,st)}
 if(data){
  if(st.attack!==attack){st.from=st.pose;st.attack=attack;}
  const desired=atTime(data.frames,Math.min(data.len,f.attackTime));
  st.pose=interpolate(st.from,desired,EASE.sine(f.attackTime/data.blend));
  return st.pose;
 }
 if(st.attack){st.attack=null;st.release=0;st.releaseFrom=st.pose;}
 if(st.release<OUT){st.release=Math.min(OUT,st.release+Math.max(0,dt||0));st.pose=interpolate(st.releaseFrom,guard,EASE.sine(st.release/OUT))}
 else st.pose=guard;
 return st.pose;
}
export function applyCombatPose(f,pose){
 const rig=saved.get(f.visual);if(!rig)throw Error('Missing joint rest state');
 const torso=pose.T||GUARD.T,head=pose.H||GUARD.H;
 for(const n of NAMES){
  const v=n==='H'?[-torso[0]*.56+head[0],-torso[1]*.75+head[1],-torso[2]*.65+head[2]]:pose[n]||GUARD[n];
  const r=rig.rest[n];rig.nodes[n].rotation.set(r[0]+v[0]*DEG,r[1]+v[1]*DEG,r[2]+v[2]*DEG);
 }
}
export function resetCombatPose(f){
 const rig=saved.get(f.visual);
 if(rig)for(const n of NAMES){const r=rig.rest[n];rig.nodes[n].rotation.set(r[0],r[1],r[2])}
 states.delete(f);
}
