import csv

def add_color_state_to_csv(file_path, output_path):
    with open(file_path, 'r') as infile, open(output_path, 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)

        for i, row in enumerate(reader):
            if i == 0:
                row.append("COLOR_STATE")
            else:
                row.append("0")
            writer.writerow(row)

input_csv = "input.csv"  
output_csv = "output.csv"  
add_color_state_to_csv(input_csv, output_csv)
