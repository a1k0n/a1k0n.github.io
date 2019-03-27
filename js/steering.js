(function(document, window) {
var track_ = [
  [13.7718103 , -1.56003487,  0.05289333,  0.99860017, -0.25064521],
  [14.14575638, -1.59755458,  0.19287819,  0.98122271, -0.50445317],
  [14.50608108, -1.70436991,  0.37304054,  0.92781504, -0.50445317],
  [14.84006102, -1.87670912,  0.54003051,  0.84164544, -0.50445317],
  [15.13590308, -2.10848675,  0.68795154,  0.72575662, -0.50445317],
  [15.38316084, -2.39151856,  0.81158042,  0.58424072, -0.50445317],
  [15.57310341, -2.71581044,  0.89279974,  0.4504538 , -0.33361134],
  [15.72132595, -3.06176203,  0.91979124,  0.39240805, -0.00818321],
  [15.86848673, -3.40817897,  0.92434595,  0.38155545, -0.05438561],
  [16.00847153, -3.75739317,  0.95622498,  0.29263251, -0.4511738 ],
  [16.08776169, -4.12469606,  0.99355879,  0.11331786, -0.53151307],
  [16.09321562, -4.50042017,  0.99642927, -0.08443167, -0.53151307],
  [16.02461998, -4.86986974,  0.9603263 , -0.27887881, -0.53151307],
  [15.88465777, -5.21859445,  0.89856379, -0.43884293, -0.38771742],
  [15.69543335, -5.54390404,  0.86259536, -0.5058945 , -0.01903673],
  [15.50386364, -5.86788249,  0.86077766, -0.50898116,  0.        ],
  [15.31229393, -6.19186094,  0.85604868, -0.5168952 , -0.04900923],
  [15.11484755, -6.51214598,  0.808825  , -0.58804941, -0.40743917],
  [14.87128921, -6.7984352 ,  0.70061391, -0.71354057, -0.48003517],
  [14.58059551, -7.03671939,  0.56218834, -0.82700923, -0.48003517],
  [14.25207934, -7.21936469,  0.40575207, -0.91398318, -0.48003517],
  [13.89626529, -7.34051973,  0.2363168 , -0.97167606, -0.48003517],
  [13.5245525 , -7.3963031 ,  0.05931071, -0.99823957, -0.48003517],
  [13.14884944, -7.38492767, -0.1195955 , -0.9928227 , -0.48003517],
  [12.78119245, -7.30675789, -0.29262028, -0.95622872, -0.46826524],
  [12.43265006, -7.16575996, -0.40018265, -0.9164354 , -0.14518635],
  [12.09195945, -7.0057884 , -0.42502809, -0.90518016, -0.        ],
  [11.75126884, -6.84581685, -0.42502809, -0.90518016, -0.        ],
  [11.41057824, -6.6858453 , -0.42502809, -0.90518016,  0.        ],
  [11.06988763, -6.52587374, -0.42502809, -0.90518016,  0.        ],
  [10.72919702, -6.36590219, -0.42502809, -0.90518016, -0.        ],
  [10.38850642, -6.20593064, -0.42502809, -0.90518016, -0.        ],
  [10.04781581, -6.04595908, -0.42502809, -0.90518016, -0.        ],
  [ 9.7071252 , -5.88598753, -0.42502809, -0.90518016,  0.        ],
  [ 9.36643459, -5.72601598, -0.42502809, -0.90518016, -0.        ],
  [ 9.02574399, -5.56604442, -0.42502809, -0.90518016,  0.        ],
  [ 8.68505338, -5.40607287, -0.39047049, -0.92061544,  0.20165059],
  [ 8.33372346, -5.27253035, -0.26638809, -0.96386585,  0.50173879],
  [ 7.96370825, -5.20671136, -0.08185412, -0.99664432,  0.50445317],
  [ 7.58791235, -5.21127709,  0.10604382, -0.99436146,  0.50445317],
  [ 7.21960545, -5.28606631,  0.27515918, -0.96139868,  0.41895888],
  [ 6.86707492, -5.41758591,  0.35737228, -0.93396202,  0.04449361],
  [ 6.51668958, -5.55503083,  0.36517712, -0.93093806, -0.        ],
  [ 6.16630425, -5.69247576,  0.36517712, -0.93093806, -0.        ],
  [ 5.81591892, -5.82992068,  0.36517712, -0.93093806,  0.        ],
  [ 5.46553358, -5.9673656 ,  0.36517712, -0.93093806, -0.        ],
  [ 5.11514825, -6.10481052,  0.36517712, -0.93093806,  0.        ],
  [ 4.76476292, -6.24225544,  0.36517712, -0.93093806, -0.        ],
  [ 4.41437759, -6.37970036,  0.36517712, -0.93093806,  0.        ],
  [ 4.06399225, -6.51714528,  0.36517712, -0.93093806, -0.        ],
  [ 3.71360692, -6.65459021,  0.36517712, -0.93093806, -0.        ],
  [ 3.36322159, -6.79203513,  0.36517712, -0.93093806,  0.        ],
  [ 3.01283626, -6.92948005,  0.35061682, -0.936519  , -0.08296888],
  [ 2.658726  , -7.05578632,  0.18674184, -0.98240902, -0.84416783],
  [ 2.28476028, -7.06787683, -0.15523972, -0.98787683, -1.0362685 ],
  [ 1.93252758, -6.941668  , -0.50747242, -0.861668  , -1.0362685 ],
  [ 1.65133926, -6.69482862, -0.78866074, -0.61482862, -1.0362685 ],
  [ 1.48056072, -6.36191537, -0.9592841 , -0.28244293, -1.03285222],
  [ 1.44366995, -5.98950432, -0.99982826, -0.01853268, -0.42845887],
  [ 1.46669433, -5.61383044, -0.99812715,  0.0611734 ,  0.        ],
  [ 1.4897187 , -5.23815656, -0.99812715,  0.0611734 , -0.        ],
  [ 1.51274307, -4.86248267, -0.99812715,  0.0611734 , -0.        ],
  [ 1.53576744, -4.48680879, -0.99812715,  0.0611734 ,  0.        ],
  [ 1.55879181, -4.11113491, -0.99812715,  0.0611734 , -0.        ],
  [ 1.58181618, -3.73546103, -0.99812063,  0.06127977, -0.00056625],
  [ 1.6049206 , -3.35979229, -0.99364455,  0.11256339, -0.27401728],
  [ 1.66637472, -2.98902714, -0.96681264,  0.25548643, -0.50445317],
  [ 1.79610678, -2.63630488, -0.90194661,  0.43184756, -0.50445317],
  [ 1.98953585, -2.31408043, -0.80523208,  0.59295978, -0.50445317],
  [ 2.23983178, -2.03373181, -0.68008411,  0.73313409, -0.50445317],
  [ 2.5381564 , -1.80515836, -0.5309218 ,  0.84742082, -0.50445317],
  [ 2.87397562, -1.63643122, -0.36301219,  0.93178439, -0.50445317],
  [ 3.23543139, -1.53350827, -0.18228431,  0.98324587, -0.50445317],
  [ 3.60976037, -1.50002382, -0.04160889,  0.99913398, -0.25337965],
  [ 3.9861326 , -1.50224535,  0.0059039 ,  0.99998257, -0.00000802],
  [ 4.36250482, -1.50446802,  0.00590541,  0.99998256,  0.        ],
  [ 4.73887704, -1.50669069,  0.00590541,  0.99998256, -0.        ],
  [ 5.11524926, -1.50891336,  0.00590541,  0.99998256,  0.        ],
  [ 5.49162148, -1.51113603,  0.00590541,  0.99998256,  0.        ],
  [ 5.8679937 , -1.5133587 ,  0.00590541,  0.99998256, -0.        ],
  [ 6.24436592, -1.51558138,  0.00590541,  0.99998256,  0.        ],
  [ 6.62073814, -1.51780405,  0.00590541,  0.99998256,  0.        ],
  [ 6.99711036, -1.52002672,  0.00590541,  0.99998256, -0.        ],
  [ 7.37348257, -1.52224939,  0.00590541,  0.99998256,  0.        ],
  [ 7.74985479, -1.52447206,  0.00590541,  0.99998256,  0.        ],
  [ 8.12622701, -1.52669473,  0.00590541,  0.99998256, -0.        ],
  [ 8.50259923, -1.5289174 ,  0.00590541,  0.99998256,  0.        ],
  [ 8.87897145, -1.53114007,  0.00590541,  0.99998256,  0.        ],
  [ 9.25534367, -1.53336274,  0.00590541,  0.99998256, -0.        ],
  [ 9.63171589, -1.53558541,  0.00590541,  0.99998256, -0.        ],
  [10.00808811, -1.53780808,  0.00590541,  0.99998256,  0.        ],
  [10.38446033, -1.54003075,  0.00590541,  0.99998256,  0.        ],
  [10.76083255, -1.54225342,  0.00590541,  0.99998256, -0.        ],
  [11.13720477, -1.54447609,  0.00590541,  0.99998256, -0.        ],
  [11.51357699, -1.54669877,  0.00590541,  0.99998256,  0.        ],
  [11.88994921, -1.54892144,  0.00590541,  0.99998256, -0.        ],
  [12.26632143, -1.55114411,  0.00590541,  0.99998256,  0.        ],
  [12.64269364, -1.55336678,  0.00590541,  0.99998256, -0.        ],
  [13.01906586, -1.55558945,  0.00590541,  0.99998256,  0.        ],
  [13.39543808, -1.55781212,  0.00590552,  0.99998256, -0.00000057],
];

var track_opt_ = [
  [13.75263876, -1.92198413,  0.33815249,  0.94109133, -0.10716046],
  [14.05895149, -2.0391542 ,  0.37402525,  0.92741852, -0.12369706],
  [14.32566891, -2.15308555,  0.4122664 ,  0.91106334, -0.14864692],
  [14.58352234, -2.2765284 ,  0.45584304,  0.89006018, -0.1818558 ],
  [14.84264894, -2.41785613,  0.51019427,  0.86005919, -0.22791855],
  [15.10948391, -2.58853318,  0.57985406,  0.81472036, -0.27711985],
  [15.39063792, -2.8078717 ,  0.66331319,  0.74834191, -0.3202291 ],
  [15.66870316, -3.08421236,  0.7520711 ,  0.65908198, -0.35607384],
  [15.90390745, -3.39355785,  0.838575  ,  0.54478617, -0.38430783],
  [16.08985889, -3.73248628,  0.91318237,  0.40755117, -0.41258367],
  [16.22331299, -4.1092361 ,  0.96890032,  0.24745133, -0.44009176],
  [16.29024851, -4.5171156 ,  0.99789125,  0.06490797, -0.46168851],
  [16.27756644, -4.9433254 ,  0.99141698, -0.13073778, -0.47502657],
  [16.1788011 , -5.36224894,  0.9467383 , -0.32200403, -0.48121292],
  [16.0104589 , -5.72866007,  0.8666585 , -0.49890184, -0.48678194],
  [15.79024561, -6.03722125,  0.75470837, -0.65606042, -0.4904954 ],
  [15.50608431, -6.30887451,  0.6138606 , -0.78941445, -0.48398958],
  [15.14826049, -6.53643857,  0.4550083 , -0.89048719, -0.4579299 ],
  [14.76327267, -6.6884257 ,  0.29603827, -0.95517608, -0.40512602],
  [14.39848044, -6.76881833,  0.16186444, -0.986813  , -0.32604534],
  [14.06707126, -6.80262185,  0.06538749, -0.99785995, -0.24115082],
  [13.76728364, -6.81017922,  0.00213539, -0.99999772, -0.16579982],
  [13.48935204, -6.80385551, -0.03827421, -0.99926727, -0.11543222],
  [13.220606  , -6.78924022, -0.0669661 , -0.99775525, -0.09218868],
  [12.94624286, -6.76740378, -0.09407189, -0.99556541, -0.08999996],
  [12.62177484, -6.73265611, -0.12366919, -0.9923235 , -0.09042724],
  [12.24493255, -6.68000237, -0.15574202, -0.98779776, -0.09001782],
  [11.86074429, -6.61266755, -0.18973819, -0.98183472, -0.08999631],
  [11.48250454, -6.53266421, -0.22379442, -0.97463637, -0.09000019],
  [11.11006941, -6.44029881, -0.25472293, -0.96701408, -0.07579293],
  [10.74243006, -6.33771986, -0.27431207, -0.96164073, -0.03031321],
  [10.37668866, -6.23109885, -0.27574919, -0.96122962,  0.02249141],
  [10.00954006, -6.12747475, -0.25883167, -0.96592244,  0.06926217],
  [ 9.63801904, -6.03316257, -0.22917691, -0.97338479,  0.08999959],
  [ 9.26071396, -5.95116867, -0.1928944 , -0.98121952,  0.10197474],
  [ 8.87668497, -5.88349466, -0.14977048, -0.98872079,  0.12782115],
  [ 8.50256588, -5.83632513, -0.1019613 , -0.99478837,  0.14503574],
  [ 8.1844767 , -5.81254645, -0.0537128 , -0.99855643,  0.15364797],
  [ 7.91459577, -5.80469795, -0.00872955, -0.9999619 ,  0.15468718],
  [ 7.65153865, -5.80789396,  0.03314764, -0.99945047,  0.15063341],
  [ 7.37318081, -5.82265445,  0.07645091, -0.99707335,  0.13711516],
  [ 7.03452546, -5.85520364,  0.11764712, -0.99305546,  0.1150172 ],
  [ 6.65504298, -5.90773212,  0.15492262, -0.98792661,  0.09377021],
  [ 6.27675081, -5.97403477,  0.18952156, -0.98187656,  0.09000081],
  [ 5.90335616, -6.05282252,  0.22095068, -0.97528498,  0.07811788],
  [ 5.53414386, -6.14227227,  0.2413129 , -0.97044736,  0.03177843],
  [ 5.1666179 , -6.23602096,  0.2423154 , -0.97019753, -0.02634617],
  [ 4.79769443, -6.32620702,  0.22409991, -0.97456618, -0.07205134],
  [ 4.42491902, -6.40657341,  0.1938415 , -0.98103286, -0.08999852],
  [ 4.04725805, -6.47448514,  0.1557252 , -0.98780042, -0.11134835],
  [ 3.66340994, -6.52662414,  0.10225877, -0.99475783, -0.16528772],
  [ 3.26999928, -6.55438552,  0.02559836, -0.99967231, -0.22434695],
  [ 2.86962366, -6.54695043, -0.06177496, -0.9980901 , -0.26988514],
  [ 2.55500501, -6.51013226, -0.1444854 , -0.98950693, -0.29240619],
  [ 2.37790411, -6.47515073, -0.21746335, -0.97606849, -0.31405914],
  [ 2.22940072, -6.4375892 , -0.2780621 , -0.9605631 , -0.36577974],
  [ 2.05356273, -6.38126096, -0.36651215, -0.93041326, -0.45039099],
  [ 1.79916414, -6.26810866, -0.52636644, -0.85025783, -0.54559456],
  [ 1.4214112 , -5.98991691, -0.70554961, -0.70866053, -0.60554931],
  [ 1.12070234, -5.59262522, -0.86659597, -0.49901045, -0.60996163],
  [ 0.97019147, -5.20631567, -0.96592487, -0.25882261, -0.5763395 ],
  [ 0.91524604, -4.82586316, -0.99903183, -0.04399312, -0.53273775],
  [ 0.93689115, -4.45010475, -0.98863207,  0.15035504, -0.49154508],
  [ 1.02888396, -4.07865782, -0.94461972,  0.32816699, -0.45810558],
  [ 1.19344656, -3.71161701, -0.87007881,  0.49291264, -0.42095112],
  [ 1.44631106, -3.34182447, -0.77486447,  0.6321274 , -0.37366869],
  [ 1.7622584 , -3.01436502, -0.67507051,  0.73775322, -0.31408866],
  [ 2.07264254, -2.76870883, -0.58726208,  0.80939684, -0.24635031],
  [ 2.35574968, -2.58375434, -0.52369891,  0.85190343, -0.18472208],
  [ 2.61330754, -2.43634056, -0.48039953,  0.87704977, -0.13738579],
  [ 2.8547249 , -2.31044321, -0.44960303,  0.89322848, -0.10909856],
  [ 3.09178294, -2.19550185, -0.42419994,  0.90556856, -0.09926876],
  [ 3.3375385 , -2.08427645, -0.39777731,  0.917482  , -0.10012391],
  [ 3.62902348, -1.96257946, -0.36630142,  0.93049625, -0.10712348],
  [ 3.98419925, -1.82971041, -0.32993809,  0.94400257, -0.10958303],
  [ 4.3613109 , -1.70663788, -0.29131069,  0.9566285 , -0.101416  ],
  [ 4.73832561, -1.60006529, -0.25489325,  0.9669692 , -0.09150937],
  [ 5.11525525, -1.50789802, -0.22066853,  0.97534886, -0.08999342],
  [ 5.49210343, -1.42952627, -0.18673834,  0.98240969, -0.09001369],
  [ 5.8688719 , -1.3646491 , -0.15280298,  0.98825667, -0.0900638 ],
  [ 6.2455621 , -1.31302745, -0.11887674,  0.99290902, -0.09000555],
  [ 6.62217521, -1.27445932, -0.08496988,  0.99638352, -0.09000104],
  [ 6.99871209, -1.24880011, -0.05344992,  0.99857053, -0.07732983],
  [ 7.37518393, -1.23415345, -0.02773844,  0.99961522, -0.05920514],
  [ 7.75160616, -1.22790797, -0.00841244,  0.99996461, -0.04345597],
  [ 8.12799202, -1.22782028,  0.0049009 ,  0.99998799, -0.0272808 ],
  [ 8.50435506, -1.23159716,  0.01249509,  0.99992193, -0.01307443],
  [ 8.88070716, -1.23722626,  0.01592704,  0.99987316, -0.00516376],
  [ 9.25705495, -1.24358696,  0.01869034,  0.99982532, -0.00952085],
  [ 9.63339476, -1.25129671,  0.02404363,  0.99971091, -0.01892714],
  [10.00971873, -1.26168896,  0.03383462,  0.99942745, -0.03310211],
  [10.38601498, -1.27677591,  0.04950911,  0.99877367, -0.05018845],
  [10.76226913, -1.29899281,  0.07214851,  0.9973939 , -0.07010095],
  [11.13846424, -1.33120586,  0.10167501,  0.99481767, -0.08677905],
  [11.51458574, -1.37588308,  0.1349344 ,  0.99085453, -0.09000467],
  [11.89063003, -1.43363566,  0.16879078,  0.9856519 , -0.09000279],
  [12.26659592, -1.50466322,  0.20264072,  0.97925315, -0.09000419],
  [12.64248192, -1.58921934,  0.23648346,  0.97163551, -0.08999805],
  [13.01828619, -1.68761486,  0.27031917,  0.96277077, -0.08999993],
  [13.39400648, -1.80022647,  0.30404185,  0.95265868, -0.09362817]
];

function drawTrack(ctx, scale, offX, offY, w, h) {
  var lanewidth = 1;

  ctx.strokeStyle = 'rgb(210, 190, 0)';
  ctx.lineWidth = 2;

  // recompute offsets from center to topleft corner
  offX -= w/(2*scale);
  offY += h/(2*scale);

  for (i = 0; i < track_.length; i+=2) {
    ctx.beginPath();
    ctx.moveTo(scale*(track_[i][0] - offX), -scale*(track_[i][1] - offY));
    ctx.lineTo(scale*(track_[i+1][0] - offX), -scale*(track_[i+1][1] - offY));
    ctx.stroke();
  }

  /*
  ctx.strokeStyle = 'rgb(128, 240, 128)';
  for (i = 0; i < track_opt_.length; i+=2) {
    ctx.beginPath();
    ctx.moveTo(scale*(track_opt_[i][0] - offX), -scale*(track_opt_[i][1] - offY));
    ctx.lineTo(scale*(track_opt_[i+1][0] - offX), -scale*(track_opt_[i+1][1] - offY));
    ctx.stroke();
  }
  */

  for (l = -lanewidth; l <= lanewidth; l += 2*lanewidth) {
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    var x0 = scale*(track_[0][0] + track_[0][2]*l - offX);
    var y0 = -scale*(track_[0][1] + track_[0][3]*l - offY);
    ctx.moveTo(x0, y0);
    for (i = 0; i < track_.length; i++) {
      var x = scale*(track_[i][0] + track_[i][2]*l - offX);
      var y = -scale*(track_[i][1] + track_[i][3]*l - offY);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x0, y0);
    ctx.stroke();
  }
}

function drawCar(c, ctx, state) {
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.arc(c.width/2, c.height/2, 5, Math.PI - state.theta - 1.5, Math.PI - state.theta + 1.5, true);
  ctx.stroke();
}

// trapezoid integration
function move(s, dv, w, dt) {
  s.v += dt*dv;
  v1 = s.v - dt*dv*0.5;

  // implied lateral accleeration
  var alat = Math.abs(w*v1);
  if (alat > 9) {
    // if the tires can't provide enough centripetal acceleration, understeer
    // w'*v1 = 9
    var wnew = Math.sign(w) * 9 / v1;
    // also scrub a bit of speed proportional to the difference
    var scrub = Math.abs(wnew - w)
    s.v -= 0.03*scrub;
    v1 = s.v;
    w = wnew;
  }

  s.theta += w*dt;

  t1 = s.theta - w*dt*0.5;
  C = Math.cos(t1);
  S = Math.sin(t1);
  s.x += C*v1*dt;
  s.y += S*v1*dt;
}

function closestpt(x, y, track) {
  var mini = 0;
  var mindist = 1e6;
  for (var i = 0; i < track.length; i++) {
    var dist = (x-track[i][0])**2 + (y-track[i][1])**2;
    if (dist < mindist) {
      mindist = dist;
      mini = i;
    }
  }
  return mini;
}

function control(carstate, strategy, track) {
  var i = closestpt(carstate.x, carstate.y, track);
  var t = track[i];
  var cx = t[0];
  var cy = t[1];
  var nx = t[2];
  var ny = t[3];
  var k = t[4];

  var ye = ((carstate.x - cx)*nx + (carstate.y - cy)*ny);
  var C = Math.cos(carstate.theta), S = Math.sin(carstate.theta);
  var Cp = -S*nx + C*ny;
  var Sp = S*ny + C*nx;
  var Cpy = Cp / (1 - k * ye);
  var Kp = 1.0;
  var Kd = 1.0;

  var Kp = 1.0;

  var control;
  var speed = 1;
  switch (strategy) {
    case "control-p":
      var Kp = document.getElementsByClassName("control-p").Kp.value
      var v = document.getElementsByClassName("control-p").v.value
      control = -Kp*ye;
      speed = v;
      break;
    case "control-pd":
      var Kp = document.getElementsByClassName("control-pd").Kp.value
      var Kd = document.getElementsByClassName("control-pd").Kd.value
      var v = document.getElementsByClassName("control-pd").v.value
      control = -Kp*(ye + Kd*Sp);
      speed = v;
      break;
    case "control-pdk":
      var Kp = document.getElementsByClassName("control-pdk").Kp.value
      var Kd = document.getElementsByClassName("control-pdk").Kd.value
      var v = document.getElementsByClassName("control-pdk").v.value
      control = -Kp*(ye + Kd*Sp) + k;
      speed = v;
      break;
    case "control-rr2097":
      var Kp = document.getElementsByClassName("control-rr2097").Kp.value
      var Kd = document.getElementsByClassName("control-rr2097").Kd.value
      var v = document.getElementsByClassName("control-rr2097").v.value
      control = Cpy*(ye*Cpy*(-Kp*Cp) + Sp*(k*Sp - Kd*Cp) + k);
      speed = v;
    case "control-rr2097v":
      var Kp = document.getElementsByClassName("control-rr2097v").Kp.value
      var Kd = document.getElementsByClassName("control-rr2097v").Kd.value
      var aL = document.getElementsByClassName("control-rr2097v").aL.value
      var vmax = document.getElementsByClassName("control-rr2097v").vmax.value
      var lookahead = document.getElementsByClassName("control-rr2097v").lookahead.value|0
      var tl = track[(i+lookahead) % track.length];
      control = Cpy*(ye*Cpy*(-Kp*Cp) + Sp*(k*Sp - Kd*Cp) + k);
      var kmin = aL / vmax**2;
      var k = Math.max(Math.abs(control), Math.abs(tl[4]));
      if (k < kmin) {
        speed = vmax;
      } else {
        speed = Math.sqrt(Math.abs(aL / k));
      }
      break;
  }

  return [control, speed];
}

function update(c, ctx, strategy, carstate) {
  dt = 1.0 / 60;
  var targetkv = control(carstate, strategy, track_);
  if (targetkv != null) {
    w = carstate.v * targetkv[0];
    move(carstate, 0.5*(targetkv[1] - carstate.v), w, dt);
    // console.log(k, carstate.theta, carstate.v);

    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, c.width, c.height);
    drawTrack(ctx, 30, carstate.x, carstate.y, c.width, c.height);
    drawCar(c, ctx, carstate);
    requestAnimationFrame(function() { update(c, ctx, strategy, carstate); });
  } else {
    var p = document.getElementById('policy')
    p.onkeyup = function() {
      p.onkeyup = null
      update(c, ctx, strategy, carstate);
    }
  }
}

window.onload = function() {
  cs = document.getElementsByClassName("linefollower");
  for (var i = 0; i < cs.length; i++) {
    var c = cs[i];
    ctx = c.getContext("2d");
    var carstate = {x: track_[0][0], y: track_[0][1] - 0.5, theta: -0.05, v: 0, w: 0};
    update(c, ctx, c.className.substr(13), carstate);
  }
}

})(document, window);
